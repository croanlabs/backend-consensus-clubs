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
      opinions(_self, _self),
      actions(_self, _self) {}

    /// @abi action
    void newuser(string name, uint64_t unopinionated_merits);

    /// @abi action
    void newpoll(string question, string description);

    /// @abi action
    void newcandidate(uint64_t poll_id,
        string name,
        string description,
        string avatar_url,
        uint32_t total_tokens_confidence,
        uint32_t total_tokens_no_confidence,
        vector<token_holder> token_holders_confidence,
        vector<token_holder> token_holders_no_confidence);

    /// @abi action
    void newopinion(uint64_t user_id, uint64_t poll_candidate_id, string opinion_type, uint32_t commitment);

    /// @abi action
    void newaction(uint64_t user_id,
        uint64_t poll_candidate_id,
        string action_type,
        double amount,
        string date);

  private:
    eosio::multi_index<N(users), user> users;
    eosio::multi_index<N(polls), poll> polls;
    eosio::multi_index<N(candidates), candidate> candidates;
    eosio::multi_index<N(opinions), opinion> opinions;
    eosio::multi_index<N(actions), conclubs::action> actions;
};

EOSIO_ABI(consensus_clubs, (newuser)(newpoll)(newcandidate)(newopinion)(newaction))
