#include <eosiolib/eosio.hpp>
#include "table_types.hpp"

using namespace eosio;
using namespace std;
using namespace conclubs;

const int ERROR = -1;

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

    /// @abi action
    void newuser(string name, uint64_t unopinionated_merits);

    /// @abi action
    void newpoll(string question, string description);

    /// @abi action
    void newcandidate(
        uint64_t poll_id,
        string name,
        string description,
        string twitter_user);

    /// @abi action
    void newcanduser(
        uint64_t user_id,
        uint64_t poll_id,
        string name,
        string description,
        string twitter_user,
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
        double amount,
        string date);

    eosio::multi_index<N(users), user>::const_iterator
      get_user_if_has_enough_merits(
        uint64_t user_id,
        uint64_t merits_amount);

    void allocate_tokens(
        uint64_t user_id,
        uint64_t candidate_id,
        bool confidence,
        uint64_t commitment_merits);

    uint64_t insert_candidate(
        uint64_t poll_id,
        string name,
        string description,
        string twitter_user);

    bool poll_id_exists(uint64_t poll_id);

    bool candidate_exists(candidate c);

  private:
    eosio::multi_index<N(users), user> users;
    eosio::multi_index<N(polls), poll> polls;
    eosio::multi_index<N(candidates), candidate,
      indexed_by<N(poll_id), const_mem_fun<candidate, uint64_t,
        &candidate::get_poll_id>>> candidates;
    eosio::multi_index<N(tokens), token,
      indexed_by<N(candidate_id), const_mem_fun<token, uint64_t,
        &token::get_candidate_id>>> tokens;
    eosio::multi_index<N(opinions), opinion> opinions;
    eosio::multi_index<N(actions), conclubs::action> actions;
};

EOSIO_ABI(consensus_clubs, (newuser)(newpoll)(newcandidate)(newcanduser)
    (newtoken)(newopinion)(newaction))
