#include <eosiolib/eosio.hpp>

using namespace std;

namespace conclubs {
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

  struct token_holder {
    uint64_t user_id;
    uint32_t amount; 
  };

  // @abi table candidates i64
  struct candidate {
    uint64_t id;
    uint64_t poll_id;
    string name;
    string description;
    string avatar_url;
    uint32_t total_tokens_confidence;
    uint32_t total_tokens_no_confidence;
    vector<token_holder> token_holders_confidence;
    vector<token_holder> token_holders_no_confidence;

    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(candidate,
        (id)(poll_id)(name)(description)(avatar_url)
        (total_tokens_confidence)(total_tokens_no_confidence)
        (token_holders_confidence)(token_holders_no_confidence))
  };

  // @abi table opinions i64
  struct opinion {
    uint64_t id;
    uint64_t user_id;
    uint64_t poll_candidate_id;
    string opinion_type;
    uint32_t commitment;

    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(opinion, (id)(user_id)(poll_candidate_id)(opinion_type)(commitment))
  };

  // @abi table actions i64
  struct action {
    uint64_t id;
    uint64_t user_id;
    uint64_t poll_candidate_id;
    string action_type;
    double amount;
    string date;

    uint64_t primary_key() const { return id; };
    EOSLIB_SERIALIZE(action, (id)(user_id)(poll_candidate_id)(action_type)(amount)(date))
  };
}
