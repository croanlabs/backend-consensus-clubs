eos-new-table --name user --table-name users \
  --attributes 'std::string name; std::string description; std::string avatar_url; uint64_t unopinionated_merits' && \
cd user && eosiocpp -o user.wast user.cpp && eosiocpp -g user.abi user.cpp
