#include <eosiolib/eosio.hpp>
#include "consensus_clubs.hpp"

using namespace std;

void consensus_clubs::newuser(string name, uint64_t unopinionated_merits) {
  users.emplace(_self, [&](auto& new_user) {
    new_user.id = users.available_primary_key();
    new_user.name = name;
    new_user.unopinionated_merits = unopinionated_merits;
  });
}

void consensus_clubs::newclub(string name,
    string description,
    string type,
    string avatar_url) {
  clubs.emplace(_self, [&](auto& new_club) {
    new_club.id = clubs.available_primary_key();
    new_club.name = name;
    new_club.description = description;
    new_club.type = type;
    new_club.avatar_url = avatar_url;
  });
}

void consensus_clubs::newmember(uint64_t user_id, uint64_t club_id) {
  memberships.emplace(_self, [&](auto& new_membership) {
    new_membership.id = memberships.available_primary_key();
    new_membership.user_id = user_id;
    new_membership.club_id = club_id;
  });
}

void consensus_clubs::newpoll(uint64_t club_id, string question, string description) {
  polls.emplace(_self, [&](auto& new_poll) {
    new_poll.id = polls.available_primary_key();
    new_poll.club_id = club_id;
    new_poll.question = question;
    new_poll.description = description;
  });
}

