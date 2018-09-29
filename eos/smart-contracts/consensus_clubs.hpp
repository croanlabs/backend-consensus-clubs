#include <eosiolib/eosio.hpp>
#include "table_types.hpp"

using namespace eosio;
using namespace std;
using namespace conclubs;

class consensus_clubs : public eosio::contract {
  public:
    using contract::contract;

    consensus_clubs(account_name self):
      contract(self),
      users(_self, _self),
      polls(_self, _self),
      candidates(_self, _self),
      tokens(_self, _self),
      opinions(_self, _self),
      actions(_self, _self) {}

    auto get_opinion_user_candidate(
          uint64_t user_id,
          uint64_t candidate_id,
          bool confidence);

    /// @abi action
    void newuser(string name, uint64_t unopinionated_merits);

    /// @abi action
    void newpoll(string question, string description);

    /// @abi action
    void newcandidate(
        uint64_t poll_id,
        string name,
        string description,
        string twitter_user,
        string profile_picture_url);

    /// @abi action
    void newcanduser(
        uint64_t user_id,
        uint64_t poll_id,
        string name,
        string description,
        string twitter_user,
        string profile_picture_url,
        bool confidence,
        uint64_t commitment_merits);

    /// @abi action
    void newtoken(
        uint64_t candidate_id,
        vector<token_holder> token_holders_confidence,
        vector<token_holder> token_holders_no_confidence);

    /// @abi action
    void newopinion(
        uint64_t user_id,
        uint64_t candidate_id,
        bool confidence,
        uint32_t commitment);

    /// @abi action
    void newaction(
        uint64_t user_id,
        uint64_t candidate_id,
        string action_type,
        double amount_merits);

    ///@abi action
    void redeem(
        uint64_t user_id,
        uint64_t candidate_id,
        bool confidence,
        double percentage);

    ///@abi action
    void newreferral(uint64_t referred_by);

    eosio::multi_index<N(users), user>::const_iterator
      get_user_if_has_enough_merits(
        uint64_t user_id,
        uint64_t merits_amount);

    double allocate_tokens(
        uint64_t user_id,
        uint64_t candidate_id,
        bool confidence,
        uint64_t commitment_merits);

    uint64_t insert_candidate(
        uint64_t poll_id,
        string name,
        string description,
        string twitter_user,
        string profile_picture_url);

    uint64_t create_or_update_opinion(
        uint64_t user_id,
        uint64_t candidate_id,
        bool confidence,
        double token_amount);

    uint64_t update_opinion_related_to_redemption(
        uint64_t user_id,
        uint64_t candidate_id,
        bool confidence,
        double token_amount);

    bool poll_id_exists(uint64_t poll_id);
    bool candidate_id_exists(uint64_t candidate_id);
    bool candidate_exists(candidate c);

  private:
    multi_index<N(users), user> users;
    multi_index<N(polls), poll> polls;
    multi_index<N(candidates), candidate,
      indexed_by<N(poll_id), const_mem_fun<candidate, uint64_t,
        &candidate::get_poll_id>>> candidates;
    multi_index<N(tokens), token,
      indexed_by<N(candidate_id), const_mem_fun<token, uint64_t,
        &token::get_candidate_id>>> tokens;
    multi_index<N(opinions), opinion,
      indexed_by<N(user_id), const_mem_fun<opinion, uint64_t,
        &opinion::get_user_id>>> opinions;
    multi_index<N(actions), conclubs::action> actions;
};

EOSIO_ABI(consensus_clubs, (newuser)(newpoll)(newcandidate)(newcanduser)
    (newtoken)(newopinion)(newaction)(newreferral)(redeem))
