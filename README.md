Link: https://bitcointalk.org/index.php?topic=524417.0

When we have multiple crypto-currencies in different wallets/exchanges/pools, it can become hard to summarise our funds and get a clear picture of where we stand financially.
That's where Crypto-Balance comes in.

It started as a personal tool for me to track the value of my different coins on different exchanges as I didn't find such service already existing.

The idea is pretty simple:
- register the api keys of different mining accounts, wallets or exchange accounts
- retrieve the balance for each account (which can be in BTC, LTC, XPM, etc...)
- retrieve the rate of altcoins in BTC with cryptocoincharts API
- retrieve the rate of non-USD fiat balances (i.e. GBP, JPY, etc... if any) in USD through Yahoo Finance API
- retrieve the BTC/USD price through CoinDesk Bitcoin Price Index
- summarise the total BTC equivalent and USD equivalent of the positions

Example of reports:

Overview: http://i.imgur.com/ciaUq4z.png

How to read the table: the first row tells that on Mar-19 at 12:00, I had 0.12 LTC, 4990 NVC, etc... which is equivalent to a total of 0.92 BTC, which is equivalent to $568 at the BPI at that time (619).

Details of a that "snapshot": http://i.imgur.com/vHVsSVw.png

A background process goes through all the registered accounts one by one every 6 hours to generate a new "snapshot".
I have plans to generate graphs and other stats from these snapshots but for now it's only the raw data and the 2 screenshots provided above.
To protect the API keys of the accounts, I encrypt the keys in the DB and store the key separately (as a config var of the app).
I do not encrypt keys that do not harm if stolen by an attacker (like mining api keys or wallet addresses which do not grant anything but read-only access).

At the moment, it support the following services:
* Bitcoin Wallet (through BlockChain, just need to give the address of the wallet)
* Litecoin Wallet (through LitecoinExplorer, just need to give the address of the wallet)
* BTC-E
* Bitfinex
* Bter
* D7 Pool
* Give-Me-Coins
* MultiPool
* NVC Khore
* YPool

It's working relatively well, but not really ready for public release yet.
As I mentioned above it was for my personal use originally and I did not plan to release it initially so the code isn't the cleanest one you'll see and I have no idea how robust it will be on long term and with many accounts.
That's why I prefer not to open it to everyone yet but prefer to test with limited users in a first time.

If you are interested in testing the site: https://bitcointalk.org/index.php?topic=524417.0
People with accounts in more than one of the above-mentioned accounts and programmers/hackers are desired, to test the robustness of the system.


# Based on the MEAN Stack

MEAN is a boilerplate that provides a nice starting point for [MongoDB](http://www.mongodb.org/), [Node.js](http://www.nodejs.org/), [Express](http://expressjs.com/), and [AngularJS](http://angularjs.org/) based applications. It is designed to give you quick and organized way to start developing of MEAN based web apps with useful modules like mongoose and passport pre-bundled and configured. We mainly try to take care of the connection points between existing popular frameworks and solve common integration problems.  ```

## More Information
  * Contact Amos Haviv on any issue via [E-Mail](mailto:mail@amoshaviv.com), [Facebook](http://www.facebook.com/amoshaviv), or [Twitter](http://www.twitter.com/amoshaviv).
  * Visit us at [Linnovate.net](http://www.linnovate.net/).
  * Visit our [Ninja's Zone](http://www.meanleanstartupmachine.com/) for extended support.

## Credits (for MEAN)
Inspired by the great work of [Madhusudhan Srinivasa](https://github.com/madhums/)
Amos Haviv [E-Mail](mailto:mail@amoshaviv.com), [Facebook](http://www.facebook.com/amoshaviv), or [Twitter](http://www.twitter.com/amoshaviv).
  * [Linnovate.net](http://www.linnovate.net/).
  * [Ninja's Zone](http://www.meanleanstartupmachine.com/) for extended support.

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
