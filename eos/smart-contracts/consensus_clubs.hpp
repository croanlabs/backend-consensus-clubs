#include <eosiolib/eosio.hpp>

using namespace eosio;
using namespace std;

class consensus_clubs : public eosio::contract {
  public:
    using contract::contract;

    consensus_clubs(account_name self):
      contract(self),
      users(_self, _self),
      clubs(_self, _self),
      memberships(_self, _self),
      polls(_self, _self) {}

    /// @abi action
    void newuser(string name, uint64_t unopinionated_merits);

    /// @abi action
    void newclub(string name, string description, string type, string avatar_url);

    /// @abi action
    void newmember(uint64_t user_id, uint64_t club_id);

    /// @abi action
    void newpoll(uint64_t club_id, string question, string description);

  private:
    // @abi table users i64
    struct user {
      uint64_t id;
      string name;
      uint64_t unopinionated_merits;
      
      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(user, (id)(name)(unopinionated_merits))
    };

    // @abi table clubs i64
    struct club {
      uint64_t id;
      string name;
      string description;
      string type;
      string avatar_url;

      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(club, (id)(name)(description)(type)(avatar_url))
    };

    // @abi table memberships i64
    struct membership {
      uint64_t id;
      uint64_t user_id;
      uint64_t club_id;

      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(membership, (id)(user_id)(club_id))
    };

    // @abi table polls i64
    struct poll {
      uint64_t id;
      uint64_t club_id;
      string question;
      string description;

      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(poll, (id)(club_id)(question)(description))
    };

    eosio::multi_index<N(users), user> users;
    eosio::multi_index<N(clubs), club> clubs;
    eosio::multi_index<N(memberships), membership> memberships;
    eosio::multi_index<N(polls), poll> polls;
};

EOSIO_ABI(consensus_clubs, (newuser)(newclub)(newmember))
