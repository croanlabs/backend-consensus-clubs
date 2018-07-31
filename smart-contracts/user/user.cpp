#include <eosiolib/eosio.hpp>

using namespace eosio;

class user_management : public eosio::contract {
  public:
    using contract::contract;

    user_management(account_name self):
      contract(self),
      users(_self, _self) {}

    /// @abi action
    void insert(std::string name, std::string description, std::string avatar_url, uint64_t unopinionated_merits) {
      users.emplace(_self, [&](auto& new_user) {
        new_user.id = users.available_primary_key();
        new_user.name = name;
        new_user.description = description;
        new_user.avatar_url = avatar_url;
        new_user.unopinionated_merits = unopinionated_merits;
      });
    }

  private:
    // @abi table users i64
    struct user {
      uint64_t id;
      std::string name;
      std::string description;
      std::string avatar_url;
      uint64_t unopinionated_merits;
      
      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(user, (id)(name)(description)(avatar_url)(unopinionated_merits))
    };

    eosio::multi_index<N(users), user> users;
};

EOSIO_ABI(user_management, (insert))
