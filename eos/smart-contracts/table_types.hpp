#include <eosiolib/eosio.hpp>
#include <math.h>

using namespace std;

namespace conclubs {
  // The bonding curve function is defined by:
  //    price(supply) = supply * a_bonding_curve
  const double a_bonding_curve = 0.25;

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

    /**
     * Sell tokens to user.
     *
     */
    double allocate_tokens_using_merits(
        uint64_t merits,
        bool confidence) {
      double supply = confidence ?
        total_tokens_confidence : total_tokens_no_confidence;
      const double token_amount = merits_to_tokens(merits, supply);
      if (confidence) {
        total_tokens_confidence += token_amount;
      } else {
        total_tokens_no_confidence += token_amount;
      }
      return token_amount;
    }

    double get_total_tokens() {
      return total_tokens_confidence + total_tokens_no_confidence;
    }

    /**
     * Convert merits to tokens.
     *
     */
    double merits_to_tokens(uint64_t merits, uint64_t supply) {
      const double newSupply = sqrt((2 * merits + supply * token_price(supply)) / a_bonding_curve);
      return newSupply - supply;
    }

    /**
     * Bonding curve function.
     *
     */
    double token_price(double supply) {
      return supply * a_bonding_curve;
    }

    uint64_t primary_key() const { return id; };
    uint64_t get_poll_id() const { return poll_id; };

    EOSLIB_SERIALIZE(candidate,
        (id)(poll_id)(name)(description)(twitter_user)
        (total_tokens_confidence)(total_tokens_no_confidence))
  };

  struct token_holder {
    uint64_t user_id;
    double amount;
  };

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
    void allocate_tokens(
        uint64_t user_id,
        double token_amount,
        bool confidence) {
      auto &holders = confidence ?
        token_holders_confidence : token_holders_no_confidence;

      std::vector<token_holder>::iterator itr =
        find_if(holders.begin(), holders.end(),
          [&](const token_holder & holder) {
            return (holder.user_id == user_id);
          });
      if (itr == holders.end()) {
        token_holder th = {};
        th.user_id = user_id;
        th.amount = token_amount;
        holders.push_back(th);
      } else {
        itr->amount += token_amount;
      }
    }

    uint64_t primary_key() const { return id; };
    uint64_t get_candidate_id() const { return candidate_id; };
    EOSLIB_SERIALIZE(token, (id)(candidate_id)
        (token_holders_confidence)(token_holders_no_confidence))
  };

  // @abi table opinions i64
  struct opinion {
    uint64_t id;
    uint64_t user_id;
    uint64_t candidate_id;
    bool confidence;
    uint32_t commitment_merits;

    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(opinion, (id)(user_id)(candidate_id)(confidence)(commitment_merits))
  };

  // @abi table actions i64
  struct action {
    uint64_t id;
    uint64_t user_id;
    uint64_t candidate_id;
    string action_type;
    double amount;
    string date;

    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(action, (id)(user_id)(candidate_id)(action_type)(amount)(date))
  };
}
