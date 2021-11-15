<template>
    <div class="mt-5">
      <div v-if="chainId != 7341" class="net-err-msg">
        <div class="card bg-dark text-secondary d-flex justify-content-center align-items-center p-3">
          <h3 class="text-white p-4">Connect to the Shyft Network to enter</h3>
          <button @click="addshftnetwork" class="btn btn-primary mb-3">Switch Now</button>
          <div class="text-left text-white">
            <p>
              <b>Network Name:&nbsp;</b>
              <span>Shyft Main</span>
              <input type="hidden" id="net" value="Shyft Main">
              <button v-if="succeedCopy!='net'" type="button" class="btn btn-rounded btn-icon">
                <i class="fa fa-copy" @click="copy('net')"></i>
              </button>
            </p>
            <p>
              <b>New RPC URL:&nbsp;</b>
              <span>https://rpc.shyft.network:64738</span>
              <input type="hidden" id="rpc" value="https://rpc.shyft.network:64738">
              <button v-if="succeedCopy!='rpc'" type="button" class="btn btn-rounded btn-icon">
                <i class="fa fa-copy" @click="copy('rpc')"></i>
              </button>
            </p>
            <p>
              <b>Chain ID:&nbsp;</b>
              <span>7341</span>
              <input type="hidden" id="chain" value="7341">
              <button v-if="succeedCopy!='chain'" type="button" class="btn btn-rounded btn-icon">
                <i class="fa fa-copy" @click="copy('chain')"></i>
              </button>
            </p>
            <p>
              <b>Currency Symbol(optional):&nbsp;</b>
              <span>SHFT</span>
              <input type="hidden" id="symbol" value="SHFT">
              <button v-if="succeedCopy!='symbol'" type="button" class="btn btn-rounded btn-icon">
                <i class="fa fa-copy" @click="copy('symbol')"></i>
              </button>
            </p>
          </div>
        </div>
      </div>
      <div v-if="chainId == 7341">
        <div class="row">
          <!-- <div v-for="l in lotteryData" :key="l.id">{{l.name}}</div> -->
          <div class="col-md-8 offset-md-2">
            <create-lottery
              :accounts="accounts"
              :lotteryCreated="lotteryCreated"
            ></create-lottery>
          </div>
        </div>
        <div v-if="!isLoading && lotteryData.length != 0" class="row voffset3 text-left">
          <b-table
            striped
            hover
            sort-icon-left
            head-variant="dark"
            table-variant="dark"
            :fields="lotteryFields"
            :items="lotteryData"
            :filter="filter"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
          >
            <template #cell(status)="data">
              <div v-if="data.item.live">
                <div class="status status-green" />
                <span>active</span>
              </div>
              <div v-else>
                <div class="status status-red" />
                <span>ended</span>
              </div>
            </template>
            <template #cell(amount)="data">
              <span v-b-tooltip.hover :title=data.item.dollar>{{data.item.amount}}&nbsp;SHFT</span>
            </template>
            <template #cell(participants)="data">
              {{data.item.participants}}
              <!-- <span v-b-tooltip.hover :title=data.item.participants><i class="fas fa-users"></i></span> -->
            </template>
            <template #cell(play)="data">
              <router-link
                 v-if="data.item.live || data.item.manager=='MANAGE'"
                :to="{
                  name: 'Lottery',
                  params: {lotteryAddress: lotteries[data.index]}
                }"
                class="ml-3"
              >
                {{data.item.manager}}
              </router-link>
            </template>
          </b-table>
        </div>
        <h3 v-if="isLoading" class="voffset5 text-white">Loading data...</h3>
        <h3 v-else-if="lotteryData.length == 0" class="voffset5 text-white">No lottery</h3>
      </div>
    </div>
</template>

<script>
import LotteryGenerator from "../web3/LotteryGenerator";
import CreateLottery from "./CreateLottery";
import Lottery from "../web3/Lottery";
import web3 from '../web3/web3';

export default {
  data: function() {
    return {
      lotteries: [],
      accounts: [],
      chainId: 0,
      sortBy: 'index',
      sortDesc: false,
      filter: "",
      isLottery: false,
      lotteryFields: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'play', label: '' },
        { key: 'status', label: 'Status' },
        { key: 'start', label: 'Created at', sortable: true },
        { key: 'end', label: 'End', sortable: true },
        { key: 'amount', label: 'Ticket Cost', sortable: true },
        { key: 'potsize', label: 'Pot Size', sortable: true },
        { key: 'fee', label: 'Creator %', sortable: true },
        { key: 'participants', label: 'Participants', sortable: true },
      ],
      lotteryData: [],
      succeedCopy: "",
      isLoading: true,
    };
  },
  methods: {
    addshftnetwork () {
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x1CAD',
          chainName: 'Shyft Mainnet',
          nativeCurrency: {
              name: 'Shyft Coin',
              symbol: 'SHFT',
              decimals: 18
          },
          rpcUrls: ['https://rpc.shyft.network:64738'],
        }]
      })
      .catch((error) => {
        console.log(error)
      }) 
    },
    copy(id) {
      let textToCopy = document.querySelector(`#${id}`)
      textToCopy.setAttribute('type', 'text')
      textToCopy.select()

      try {
        document.execCommand('copy');
        this.succeedCopy = id;
      } catch (err) {
      }
      textToCopy.setAttribute('type', 'hidden')
      window.getSelection().removeAllRanges();
    },
    async lotteryCreated(lotteryAddress) {
      this.lotteries.push(lotteryAddress);
      this.addLottery(lotteryAddress);
    },
    addLottery(lottery) {
      Lottery.options.address = lottery;
      var new_lottery = { name: "", start: "", end: "", potsize: 0, amount: 0, fee: 0, participants: 0, dollar: 0, manager: "", live: true };
      Lottery.methods.lotteryName().call().then((result) => {
        new_lottery.name = result;
      });
      Lottery.methods.createdAt().call().then((result) => {
        new_lottery.start = result;
      });
      Lottery.methods.endAt().call().then((result) => {
        new_lottery.end = result;
      });
      Lottery.methods.potSize().call().then((result) => {
        new_lottery.potsize = result + ' SHFT';
      });
      Lottery.methods.coinsRequired().call().then((result) => {
        new_lottery.amount = result;
        new_lottery.dollar = result * 0.6499 + '$';
      });
      Lottery.methods.creatorFee().call().then((result) => {
        new_lottery.fee = result + '%';
      });
      Lottery.methods.getPlayers().call().then((result) => {
        if (result.length == 0 || result.length == 1) {
          new_lottery.participants = result.length.toString() + ' participant';
        } else {
          new_lottery.participants = result.length.toString() + ' participants';
        }
      });
      Lottery.methods.manager().call().then(result => {
        if (result == this.accounts[0]) {
          new_lottery.manager = "MANAGE";
        } else {
          new_lottery.manager = "PLAY";
        }
      });
      Lottery.methods.isLotteryLive().call().then((result) => {
        new_lottery.live = result;
      });
      this.lotteryData.push(new_lottery);
    }
  },
  components: {
    CreateLottery,
  },
  created() {
    web3.eth.getChainId().then((result => {
      this.chainId = result;
      if (this.chainId == 7341) {
        this.isLoading = true;
        LotteryGenerator.methods.getLotteries().call().then((result) => {
          this.lotteries = result;
          this.lotteries.forEach((lottery) => {
            this.addLottery(lottery);
          });
          this.isLoading = false;
        });
        web3.eth.getAccounts().then(metaMaskAccounts => {
          this.accounts = metaMaskAccounts;
        });
      }
    }));
    web3.currentProvider.on("chainChanged", async (chainid) => {
      this.chainId = chainid;
      if (this.chainId == 7341) {
        this.lotteries = await LotteryGenerator.methods.getLotteries().call();
        web3.eth.getAccounts().then(metaMaskAccounts => {
          this.accounts = metaMaskAccounts;
        });
      }
    });
  }
};
</script>

<style>
.btn-icon {
  background-color: transparent;
  border: none;
  border-radius: 50%;
  color: white;
  padding: 4px 10px;
  font-size: 16px;
  cursor: pointer;
}

.btn-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn-icon:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.status {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  display: inline-block;
}

.status-green {
  background-color: green;
}

.status-red {
  background-color: red;
}

.net-err-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
