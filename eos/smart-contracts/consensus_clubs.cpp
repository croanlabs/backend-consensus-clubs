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
 */
void consensus_clubs::newcandidate(
    uint64_t poll_id,
    string name,
    string description,
    string avatar_url,
    uint32_t total_tokens_confidence,
    uint32_t total_tokens_no_confidence,
    vector<token_holder> token_holders_confidence,
    vector<token_holder> token_holders_no_confidence) {
      candidates.emplace(_self, [&](auto& new_candidate) {
        new_candidate.id = candidates.available_primary_key();
        new_candidate.poll_id = poll_id;
        new_candidate.name = name;
        new_candidate.description = description;
        new_candidate.avatar_url = avatar_url;
        new_candidate.total_tokens_confidence = total_tokens_confidence;
        new_candidate.total_tokens_no_confidence = total_tokens_no_confidence;
        new_candidate.token_holders_confidence = token_holders_confidence;
        new_candidate.token_holders_no_confidence = token_holders_no_confidence;
      });
}

/**
 * Insert a new opinion into the opinions table.
 *
 */
void consensus_clubs::newopinion(
    uint64_t user_id,
    uint64_t poll_candidate_id, 
    string opinion_type, 
    uint32_t commitment) {
  opinions.emplace(_self, [&](auto& new_opinion) {
    new_opinion.id = opinions.available_primary_key();
    new_opinion.user_id = user_id;
    new_opinion.poll_candidate_id = poll_candidate_id;
    new_opinion.opinion_type = opinion_type;
    new_opinion.commitment = commitment;
  });
}

/**
 * Insert a new user action into the actions table.
 *
 */
void consensus_clubs::newaction(uint64_t user_id,
    uint64_t poll_candidate_id,
    string action_type,
    double amount,
    string date) {
  actions.emplace(_self, [&](auto& new_action) {
    new_action.id = actions.available_primary_key();
    new_action.user_id = user_id;
    new_action.poll_candidate_id = poll_candidate_id;
    new_action.action_type = action_type;
    new_action.amount = amount;
    new_action.date = date;
  });
}

