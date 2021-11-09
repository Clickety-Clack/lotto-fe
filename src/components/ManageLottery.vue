<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <h5 class="card-header">Manage Lottery</h5>
        <div class="card-body">
          <div v-if="!isLotteryLive">
            <div class="row">
              <button
                style="margin:auto"
                class="btn btn-danger"
                @click="deleteLottery"
              >
                Delete Lottery
              </button>
            </div>
          </div>
          <div v-if="showError" class="alert alert-danger voffset2" role="alert">
            There was an error while making transaction. Try again later.
          </div>
          <div
            v-if="showProgress || deleteShowProgress || activeShowProgress"
            class="progress voffset2"
          >
            <div
              v-if="showProgress"
              class="progress-bar progress-bar-striped progress-bar-animated"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="{'width': '100%'}"
            >
              Choosing winner...
            </div>
            <div
              v-if="deleteShowProgress"
              class="progress-bar progress-bar-striped progress-bar-animated"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="{'width': '100%'}"
            >
              Deleting lottery...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Lottery from "../web3/Lottery";
import LotteryGenerator from "../web3/LotteryGenerator";

export default {
  props: [
    "lotteryAddress",
    "isLotteryLive",
    "accounts",
    "changeLotteryStatus",
    "updateWinner",
  ],
  data() {
    return {
      maxEntriesPerPlayer: 1,
      ethRequiredToParticipate: 1,
      showError: false,
      showProgress: false,
      deleteShowProgress: false,
      activeShowProgress: false,
      progress: 0,
      currentTime: null,
      remainTime: "",
      timeCounter: null,
      deadline: null,
    };
  },
  computed: {
  },
  methods: {
    isNumber: function(evt) {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        evt.preventDefault();;
      } else {
        return true;
      }
    },
    getCurrentTime () {
      var currentDate = new Date();
      var endDate = new Date(this.deadline);

      var diff = endDate.getTime() - currentDate.getTime();
      if (diff <= 0) {
        this.remainTime = "End";
        clearInterval(this.timeCounter);
        this.declareWinner();
      } else {
        diff = diff / 1000;
        var diffH = Math.floor(diff / 3600);
        var diffM = Math.floor((diff - 3600 * diffH) / 60);
        var diffS = Math.floor(diff - diffH * 3600 - diffM * 60);
        this.remainTime = `${diffH}Hours ${diffM}Minutes ${diffS}Seconds`;
        this.currentTime = currentDate;
      }
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

    deleteLottery() {
      LotteryGenerator.methods
        .deleteLottery(this.lotteryAddress)
        .send({
          from: this.accounts[0],
          gas: 200000
        })
        .once("transactionHash", hash => {
          this.deleteShowProgress = true;
        })
        .on("error", error => {
          console.log(error);
          this.showError = true;
        })
        .then(reciept => {
          this.deleteShowProgress = false;
          this.$router.push('/');
        });
    }
  },
  created() {
    Lottery.options.address = this.lotteryAddress;

    Lottery.methods
      .endAt()
      .call()
      .then(result => {
        this.deadline = result;
        if (this.isLotteryLive) {
          this.timeCounter = setInterval(this.getCurrentTime, 1000);
        }
      });
  },
  destroyed() {
    clearInterval(this.timeCounter);
  }
};
</script>

<style>

</style>
