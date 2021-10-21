<template>
  <div class="col-md-4" style="padding-top: 15px; padding-bottom:15px;">
    <div class="card">
      <h6 class="card-header">{{lotteryName}}</h6>
      <div class="card-body">
        <h6 class="card-title">{{'End : ' + endAt}}</h6>
        <h6 class="card-title">{{'Total winnings size : ' + winningPrice}}</h6>
        <h6 class="card-title">{{'Average player size : ' + averagePrice}}</h6>
        <hr/>
        <div class="row">
          <div class="col-md-6">
              <router-link
                :to="{
                  name: 'Lottery',
                  params: {lotteryAddress: lotteryAddress}
                }"
                class="btn btn-primary"
              >
                {{isMyLottery() ? 'Manage' : 'Details'}}
              </router-link>
          </div>
          <div class="col-md-6 lottery-status">
            <span
              class="lottery-status-icon"
              :class="isLotteryLive? 'lottery-status-icon-green': 'lottery-status-icon-red'"
            ></span>
              {{isLotteryLive? 'Live': 'Closed'}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lottery from "../web3/Lottery";
import web3 from "../web3/web3";

var accounts = [];

export default {
  props: ["lotteryAddress", "accounts"],
  data() {
    return {
      lotteryName: "",
      lotteryManager: "",
      endAt: "",
      isLotteryLive: false,
      winningPrice: 0,
      averagePrice: 0,
    };
  },
  methods: {
    isMyLottery() {
      return this.accounts[0] === this.lotteryManager;
    }
  },
  async created() {
    Lottery.options.address = this.lotteryAddress;
    var playersAddresses = await Lottery.methods.getPlayers().call();
    var totalPlayers = playersAddresses.length;

    Lottery.methods
      .lotteryName()
      .call()
      .then(name => {
        this.lotteryName = name;
      });

    Lottery.methods
      .manager()
      .call()
      .then(managerAddress => {
        this.lotteryManager = managerAddress;
      });

    Lottery.methods
      .deadline()
      .call()
      .then(deadline => {
        this.endAt = deadline;
      });

    Lottery.methods
      .isLotteryLive()
      .call()
      .then(status => {
        this.isLotteryLive = status;
      });

    Lottery.methods
      .getWinningPrice()
      .call()
      .then(result => {
        this.winningPrice = web3.utils.fromWei(result, "ether");
        if (totalPlayers != 0) {
          this.averagePrice = this.winningPrice / totalPlayers;
          this.averagePrice = this.averagePrice;
        } else {
          this.averagePrice = 0;
        }
      });
  }
};
</script>

<style>
.lottery-status {
  margin: auto;
}
.lottery-status-icon {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: inline-block;
  vertical-align: text-bottom;
}

.lottery-status-icon-red {
  background-color: #e5003a;
}

.lottery-status-icon-green {
  background-color: green;
}

.my-lottery-color {
  background-color: lightgreen;
}
</style>
