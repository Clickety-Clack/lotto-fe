<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card bg-dark text-white">
        <h5 class="card-header">Manage Lottery</h5>
        <div class="card-body">
          <div v-if="!isLotteryLive && !deleteShowProgress">
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
          <div v-if="deleteShowProgress" class="progress voffset2" style="height: 30px">
            <div
              class="progress-bar progress-bar-striped progress-bar-animated"
              aria-valuemin="0"
              aria-valuemax="100"
              :style="{'width': '100%', 'font-size': '20px'}"
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
      showError: false,
      deleteShowProgress: false,
      progress: 0,
    };
  },
  computed: {
  },
  methods: {
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
          this.deleteShowProgress = false;
          this.showError = true;
        })
        .then(reciept => {
          this.deleteShowProgress = false;
          this.$router.push('/');
        });
    }
  },
  created() {
  },
  destroyed() {
  }
};
</script>

<style>

</style>
