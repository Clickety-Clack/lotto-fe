<template>
<div>
  <router-link
    :to="{
      name: 'LotteriesList',
    }"
    class="back-icon"
  >
    <i class="fas fa-hand-point-left"></i>
  </router-link>
  <div class="row mt-5" v-if="accounts[0]">
    <div class="col-md-4 offset-md-4" v-if="winner.name">
      <div class="card bg-dark text-white">
        <div class="card-header">Winner<h3>{{winner.name}}</h3></div>
      </div>
    </div>
    <div class="col-md-6 offset-md-3">
      <div class="alert alert-danger" v-if="isDisabled">Ending in: {{this.remainTime}}</div>
      <div class="alert alert-danger" v-if="!isDisabled">{{this.remainTime}}</div>
    </div>
  </div>
  <div class="row voffset4" v-if="isLotteryLive">
    <div class="col-md-6">
      <participants
        :lotteryAddress="lotteryAddress"
        :accounts="accounts"
      ></participants>
    </div>
    <div class="col-md-6">
      <participate
        :lotteryAddress="lotteryAddress"
        :accounts="accounts"
      ></participate>
    </div>
  </div>
  <div class="row voffset4" v-else>
    <div class="col-md-6 offset-md-3">
      <participants
        :lotteryAddress="lotteryAddress"
        :accounts="accounts"
      ></participants>
    </div>
  </div>
  <div class="row voffset4" v-if="isLotteryLive">
    <div class="col-md-2" />
    <div class="col-md-8">
      <div
        v-if="showProgress"
        class="progress-bar progress-bar-striped progress-bar-animated"
        aria-valuemin="0"
        aria-valuemax="100"
        :style="{'width': '100%'}"
      >
        Choosing winner...
      </div>
    </div>
    <div class="col-md-2" />
  </div>
  <div class="row voffset3" v-if="isManager() && !isLotteryLive">
    <div class="col-md-6 offset-md-3">
      <manager-lottery
        :lotteryAddress="lotteryAddress"
        :accounts="accounts"
        :isLotteryLive="isLotteryLive"
        :changeLotteryStatus="changeLotteryStatus"
        :updateWinner="updateWinner"
      ></manager-lottery>
    </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";
import Participate from "./Participate";
import Participants from "./Participants";
import ManagerLottery from "./ManageLottery";

import web3 from "../web3/web3";

import Lottery from "../web3/Lottery";

export default {
  components: {
    Participate,
    Participants,
    ManagerLottery
  },
  data() {
    return {
      lotteryAddress: this.$route.params.lotteryAddress,
      endAt: "",
      winner: {},
      accounts: [],
      isLotteryLive: false,
      lotteryManager: "",
      currentTime: null,
      remainTime: "Calculating...",
      timeCounter: null,
      showProgress: false
    };
  },
  computed: {
  	isDisabled: function() {
    	return this.remainTime != "Ended";
    }
  },
  methods: {
    getCurrentTime () {
      var currentDate = new Date();
      var endDate = new Date(this.endAt);
      var diff = endDate.getTime() - currentDate.getTime();
      if (diff <= 0) {
        this.remainTime = "Ended";
        clearInterval(this.timeCounter);
        Lottery.methods.getPlayers().call().then((result) => {
          if (result.length > 0 && this.isLotteryLive) {
            this.declareWinner();
          } else {
            this.changeLotteryStatus(false);
          }
        });
      } else if (diff > 0) {
        diff = diff / 1000;
        var diffH = Math.floor(diff / 3600);
        var diffM = Math.floor((diff - 3600 * diffH) / 60);
        var diffS = Math.floor(diff - diffH * 3600 - diffM * 60);
        this.remainTime = `${diffH} Hours ${diffM} Minutes ${diffS} Seconds`;
        this.currentTime = currentDate;
      }
    },
    isManager() {
      return this.lotteryManager === this.accounts[0];
    },
    changeLotteryStatus(status) {
      this.isLotteryLive = status;
    },
    updateWinner(winner) {
      this.winner = winner;
    },
    declareWinner() {
      Lottery.methods
        .declareWinner()
        .send({
          from: this.accounts[0],
          gas: 200000
        })
        .once("transactionHash", hash => {
          this.showProgress = true;
        })
        .on("error", error => {
          console.log(error);
          this.showError = true;
          this.showProgress = false;
        })
        .then(reciept => {
          this.showProgress = false;
          this.changeLotteryStatus(false);
          this.updateWinner(reciept.events.WinnerDeclared.returnValues);
        });
    },
  },
  async created() {
    this.accounts = await web3.eth.getAccounts();
    this.timeCounter = setInterval(this.getCurrentTime, 1000);
    Lottery.options.address = this.lotteryAddress;
    Lottery.methods
      .winner()
      .call()
      .then(result => {
        this.winner = result;
      });

    Lottery.methods
      .isLotteryLive()
      .call()
      .then(status => {
        this.changeLotteryStatus(status);
      });

    Lottery.methods
      .manager()
      .call()
      .then(managerName => {
        this.lotteryManager = managerName;
      });
    Lottery.methods
      .endAt()
      .call()
      .then(deadline => {
        this.endAt = deadline;
      });
  },
  destroyed() {
    clearInterval(this.timeCounter);
  },
  mounted() {
  }
};
</script>

<style>
.back-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 30px;
  color: white;
}
</style>
