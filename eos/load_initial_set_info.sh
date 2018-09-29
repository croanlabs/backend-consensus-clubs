cleos push action $EOS_USERNAME newuser "[\"admin\", 9999999]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newuser "[\"test\", 9999999]" -p $EOS_USERNAME

cleos push action $EOS_USERNAME newpoll  "[\"Which tokens should become tradable on Ethfinex?\", \"Tradable tokens Ethfinex.\"]" -p $EOS_USERNAME

cleos push action $EOS_USERNAME newpoll  "[\"Who are the most insightful crypto investors?\", \"Best investor in crypto.\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[1, \"Meltem Demirors\",\"<<Description>>\", \"@melt_dem\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[1, \"Chris Burniske\",\"<<Description>>\", \"@cburniske\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[1, \"Ari Paul\",\"<<Description>>\", \"@aridavidpaul\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[1, \"NM\",\"<<Description>>\", \"@bytesizecapital\", \"\"]" -p $EOS_USERNAME

cleos push action $EOS_USERNAME newpoll  "[\"What are the best ICOs in 2018?\", \"Best ICOs in 2018.\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[2, \"FlipNpik\", \"FlipNpik is the only ecosystem that allows you to monetize your social media posts by supporting local businesses.\", \"@flipnpik\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[2, \"Dominium\",\"Dominium Blockchain – The one-stop-platform for everything to do with property anywhere in the world!\", \"@Dominium_me\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[2, \"Review.network\",\"A Decentralized High Quality Market Feedback Platform - Market Research and User Reviews on the Blockchain\", \"@ReviewNetworkHQ\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[2, \"Qravity\", \"Qravity is a decentralized content production and distribution platform where creators own and profit from their work.\", \"@qravitycom\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[2, \"Agate\", \"World's most comprehensive decentralized blockchain platform for instant payment without volatility risk to mainstream crypto adoption.\", \"@AgateChain\", \"\"]" -p $EOS_USERNAME
cleos push action $EOS_USERNAME newcandidate "[2, \"Friend\", \"World's first decentralised, open source platform; enabling people to connect anywhere, from any device, to their personal data without an intermediary.\", \"@FriendUPCloud\", \"\"]" -p $EOS_USERNAME

#cleos push action $EOS_USERNAME newpoll  "[\"What are the best cryptocurrency books of 2018?\", \"Best cryptobooks in 2018.\"]" -p $EOS_USERNAME
#cleos push action $EOS_USERNAME newcandidate "[3, \"The Crypto Intro\",\"Author: Nathan Rose\", \"@CryptoIntro\", \"\"]" -p $EOS_USERNAME
#cleos push action $EOS_USERNAME newcandidate "[3, \"Digital Gold\",\"Author: Nathaniel Popper\", \"@DigitalGold\", \"\"]" -p $EOS_USERNAME
