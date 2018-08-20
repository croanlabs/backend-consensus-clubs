#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include "consensus_clubs.hpp"

using namespace std;

/**
 * Insert a new user into the users table.
 *
 */
void consensus_clubs::newuser(string name, uint64_t unopinionated_merits) {
  users.emplace(_self, [&](auto& new_user) {
    new_user.id = users.available_primary_key();
    new_user.name = name;
    new_user.unopinionated_merits = unopinionated_merits;
  });
}

/**
 * Insert a new poll into the polls table.
 *
 */
void consensus_clubs::newpoll(string question, string description) {
  polls.emplace(_self, [&](auto& new_poll) {
    new_poll.id = polls.available_primary_key();
    new_poll.question = question;
    new_poll.description = description;
  });
}

/**
 * Insert a new candidate into the candidates table.
 *
 * This function is likely to be used to create the initial set of polls
 * or to be executed by the admin as it does not imply staking any merits
 * on the new option.
 *
 */
void consensus_clubs::newcandidate(
    uint64_t poll_id,
    string name,
    string description,
    string twitter_user) {
  const auto candidate_id = candidates.available_primary_key();
  candidates.emplace(_self, [&](auto& new_candidate) {
    new_candidate.id = candidate_id;
    new_candidate.poll_id = poll_id;
    new_candidate.name = name;
    new_candidate.description = description;
    new_candidate.twitter_user = twitter_user;
    new_candidate.total_tokens_confidence = 0;
    new_candidate.total_tokens_no_confidence = 0;
  });
  tokens.emplace(_self, [&](auto& new_token) {
    new_token.id = tokens.available_primary_key();
    new_token.candidate_id = candidate_id;
    new_token.token_holders_confidence = {};
    new_token.token_holders_no_confidence = {};
  });
}

/**
 * Insert a new candidate added by a user.
 *
 */
void consensus_clubs::newcanduser(
    uint64_t user_id,
    uint64_t poll_id,
    string name,
    string description,
    string twitter_user,
    bool confidence,
    uint64_t commitment_merits) {
  // Check if the user has enough amount of available merits.
  auto itr_user =
    get_user_if_has_enough_merits(user_id, commitment_merits);
  if (itr_user == users.end()) {
    return;
  }

  // Calculate amount of tokens and insert candidate
  // TODO check if the candidate already exists.
  const auto candidate_id = candidates.available_primary_key();
  candidates.emplace(_self, [&](auto& new_candidate) {
    new_candidate.id = candidate_id;
    new_candidate.poll_id = poll_id;
    new_candidate.name = name;
    new_candidate.description = description;
    new_candidate.twitter_user = twitter_user;
    new_candidate.total_tokens_confidence = 0;
    new_candidate.total_tokens_no_confidence = 0;
  });

  // Initialize token for candidate
  tokens.emplace(_self, [&](auto& new_token) {
    new_token.id = tokens.available_primary_key();
    new_token.candidate_id = candidate_id;
    new_token.token_holders_confidence = {};
    new_token.token_holders_no_confidence = {};
  });

  // Allocate new tokens
  newopinion(user_id, candidate_id, confidence, commitment_merits);
}

/**
 * Insert token information for a new candidate.
 *
 */
void consensus_clubs::newtoken(
    uint64_t candidate_id,
    vector<token_holder> token_holders_confidence,
    vector<token_holder> token_holders_no_confidence) {
  tokens.emplace(_self, [&](auto& new_token) {
    new_token.id = tokens.available_primary_key();
    new_token.candidate_id = candidate_id;
    new_token.token_holders_confidence = token_holders_confidence;
    new_token.token_holders_no_confidence = token_holders_no_confidence;
  });
}

/**
 * Check if user has enough number of unopinionated merits.
 *
 * If the user has enough merits it returns the pk iterator
 * to the user, if not return users.end().
 *
 */
eosio::multi_index<N(users), user>::const_iterator consensus_clubs::
    get_user_if_has_enough_merits(
        uint64_t user_id,
        uint64_t merits_amount) {
  auto itr = users.find(user_id);
  if (itr == users.end()) {
    return itr;
  }
  if ((*itr).unopinionated_merits < merits_amount) {
    return users.end();
  } else {
    return itr;
  }
}

/**
 * Allocate tokens.
 *
 * Users give their opinion about poll candidates and that is processed
 * as buying candidate's confidence or no-confidence tokens.
 *
 */
void consensus_clubs::allocate_tokens(
    uint64_t user_id,
    uint64_t candidate_id,
    bool confidence,
    uint64_t commitment_merits) {

  // Update general token totals of the candidate
  auto itr_candidate = candidates.find(candidate_id);
  auto edited_candidate = *itr_candidate;
  auto token_amount =
    edited_candidate.allocate_tokens_using_merits(
        commitment_merits,
        confidence);
  candidates.modify(itr_candidate, _self, [&](auto& c) {
    c.total_tokens_confidence =
      edited_candidate.total_tokens_confidence;
    c.total_tokens_no_confidence =
      edited_candidate.total_tokens_no_confidence;
  });

  // Update candidate token holders
  auto cid_index = tokens.get_index<N(candidate_id)>();
  auto itr_token = cid_index.find(candidate_id);
  auto transf_token = *itr_token;
  transf_token.allocate_tokens(user_id, token_amount, confidence);
  cid_index.modify(itr_token, _self, [&](auto& t) {
    t.token_holders_confidence =
      transf_token.token_holders_confidence;
    t.token_holders_no_confidence =
      transf_token.token_holders_no_confidence;
  });
}

/**
 * Insert a new opinion into the opinions table.
 *
 */
void consensus_clubs::newopinion(
    uint64_t user_id,
    uint64_t candidate_id,
    bool confidence,
    uint32_t commitment_merits) {

  // Check and update user's data
  auto user_itr = get_user_if_has_enough_merits(
      user_id, commitment_merits);
  if (user_itr == users.end()) {
    return;
  }
  users.modify(user_itr, _self, [&](auto& user) {
    user.unopinionated_merits -= commitment_merits;
  });

  // Create opinion
  opinions.emplace(_self, [&](auto& new_opinion) {
    new_opinion.id = opinions.available_primary_key();
    new_opinion.user_id = user_id;
    new_opinion.candidate_id = candidate_id;
    new_opinion.confidence = confidence;
    new_opinion.commitment_merits = commitment_merits;
  });

  allocate_tokens(user_id, candidate_id, confidence, commitment_merits);
}

/**
 * Insert a new user action into the actions table.
 *
 */
void consensus_clubs::newaction(uint64_t user_id,
    uint64_t candidate_id,
    string action_type,
    double amount,
    string date) {
  actions.emplace(_self, [&](auto& new_action) {
    new_action.id = actions.available_primary_key();
    new_action.user_id = user_id;
    new_action.candidate_id = candidate_id;
    new_action.action_type = action_type;
    new_action.amount = amount;
    new_action.date = date;
  });
}
