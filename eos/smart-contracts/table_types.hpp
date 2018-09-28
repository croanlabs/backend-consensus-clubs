#include <eosiolib/eosio.hpp>
#include <math.h>

using namespace std;

namespace conclubs {
  // The bonding curve function is defined by:
  //    price(supply) = supply * a_bonding_curve
  const double a_bonding_curve = 0.25;

  const int error = -1;
  const int ok = 0;

  // @abi table users i64
  struct user {
    uint64_t id;
    string name;
    uint64_t unopinionated_merits;
    
    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(user, (id)(name)(unopinionated_merits))
  };

  // @abi table polls i64
  struct poll {
    uint64_t id;
    string question;
    string description;

    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(poll, (id)(question)(description))
  };

  // @abi table candidates i64
  struct candidate {
    uint64_t id;
    uint64_t poll_id;
    string name;
    string description;
    string twitter_user;
    double total_tokens_confidence;
    double total_tokens_no_confidence;
    uint64_t total_merits_confidence;
    uint64_t total_merits_no_confidence;

    /**
     * Update token totals: sell tokens to user.
     *
     */
    double allocate_tokens(
        double token_amount,
        uint64_t commitment_merits,
        bool confidence) {
      if (confidence) {
        total_tokens_confidence += token_amount;
        total_merits_confidence += commitment_merits;
      } else {
        total_tokens_no_confidence += token_amount;
        total_merits_no_confidence += commitment_merits;
      }
      return token_amount;
    }

    /**
     * Update token totals: free tokens.
     *
     */
    double free_tokens(
        double token_amount,
        uint64_t commitment_merits,
        bool confidence) {
      if (confidence) {
        total_tokens_confidence -= token_amount;
        total_merits_confidence -= commitment_merits;
      } else {
        total_tokens_no_confidence -= token_amount;
        total_merits_no_confidence -= commitment_merits;
      }
      return token_amount;
    }

    double get_total_tokens() {
      return total_tokens_confidence + total_tokens_no_confidence;
    }

    uint64_t primary_key() const { return id; };
    uint64_t get_poll_id() const { return poll_id; };

    EOSLIB_SERIALIZE(candidate,
        (id)(poll_id)(name)(description)(twitter_user)
        (total_tokens_confidence)(total_tokens_no_confidence)
        (total_merits_confidence)(total_merits_no_confidence))
  };

  struct token_holder {
    uint64_t user_id;
    double token_amount;
  };

  struct exchange_result {
    int result_code;
    uint64_t merits;
    double token_amount;
  };

  /**
   * The tokens table stores token holders information for each candidate.
   * Each row contains the tokens info for one candidate.
   *
   */
  // @abi table tokens
  struct token {
    uint64_t id;
    uint64_t candidate_id;
    vector<token_holder> token_holders_confidence;
    vector<token_holder> token_holders_no_confidence;

    /**
     * Allocate tokens for a user.
     *
     */
    double allocate_tokens(
        uint64_t user_id,
        uint64_t commitment_merits,
        bool confidence,
        double supply) {
      auto &holders = confidence ?
        token_holders_confidence : token_holders_no_confidence;
      auto token_amount = merits_to_tokens_buy(commitment_merits, supply);
      std::vector<token_holder>::iterator itr =
        find_if(holders.begin(), holders.end(),
          [&](const token_holder & holder) {
            return (holder.user_id == user_id);
          });
      if (itr == holders.end()) {
        token_holder th = {};
        th.user_id = user_id;
        th.token_amount = token_amount;
        holders.push_back(th);
      } else {
        itr->token_amount += token_amount;
      }
      return token_amount;
    }

    /**
     * User frees tokens and gets merits.
     *
     */
    exchange_result free_tokens(
        uint64_t user_id,
        double percentage,
        bool confidence,
        double supply) {
      auto &holders = confidence ?
        token_holders_confidence : token_holders_no_confidence;
      std::vector<token_holder>::iterator itr =
        find_if(holders.begin(), holders.end(),
          [&](const token_holder & holder) {
            return (holder.user_id == user_id);
          });
      exchange_result exchange;
      if (itr == holders.end()) {
        exchange.result_code = error;
        return exchange;
      }
      if (percentage == 100) {
        exchange.token_amount = itr->token_amount;
        holders.erase(itr);
      } else {
        exchange.token_amount = itr->token_amount * percentage / 100;
        itr->token_amount -= exchange.token_amount;
      }
      exchange.merits = tokens_to_merits_redeem(exchange.token_amount, supply);
      exchange.result_code = ok;
      return exchange;
    }

    /**
     * Convert merits to tokens.
     *
     */
    double merits_to_tokens_buy(uint64_t merits, double supply) {
      const double newSupply =
        sqrt((2 * merits + supply * token_price(supply)) / a_bonding_curve);
      return newSupply - supply;
    }

    /**
     * Convert tokens to merits.
     *
     */
    double tokens_to_merits_redeem(double token_amount, double supply) {
      double supply_after = supply - token_amount;
      return (supply * token_price(supply) - supply_after * token_price(supply_after)) / 2;
    }

    /**
     * For a user that has already expressed an opinion about a candidate,
     * get the number of tokens that have to be sold to get the redemption
     * passed as parameter (in merits).
     *
     */
    double merits_to_tokens_redeem(uint64_t merits, double supply) {
      const double new_supply =
        sqrt((supply * token_price(supply) - 2 * merits) / a_bonding_curve);
      return supply - new_supply;
    }

    /**
     * Bonding curve function.
     *
     */
    double token_price(double supply) {
      return supply * a_bonding_curve;
    }

    uint64_t primary_key() const { return id; };
    uint64_t get_candidate_id() const { return candidate_id; };
    EOSLIB_SERIALIZE(token, (id)(candidate_id)
        (token_holders_confidence)(token_holders_no_confidence))
  };

  /**
   * On the opinions table the live opinion of users is maintained.
   *
   * If a user expresses more than one opinion on a candidate the existing
   * opinion is updated. For a complete registry of all users' opinions and
   * redemptions check the 'actions' table.
   *
   */
  // @abi table opinions i64
  struct opinion {
    uint64_t id;
    uint64_t user_id;
    uint64_t candidate_id;
    bool confidence;
    uint32_t token_amount;

    uint64_t primary_key() const { return id; };
    uint64_t get_user_id() const { return user_id; };
    EOSLIB_SERIALIZE(opinion, (id)(user_id)(candidate_id)(confidence)(token_amount))
  };

  /**
   * All users' actions on the system related to opinion expression and token
   * redemption are inserted into this table. Each action generates a new row
   * and rows should not be updated.
   *
   */
  // @abi table actions i64
  struct action {
    uint64_t id;
    uint64_t user_id;
    uint64_t candidate_id;
    string action_type;
    uint64_t amount_merits;
    time date_time;

    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(action, (id)(user_id)(candidate_id)(action_type)(amount_merits)(date_time))
  };
}
