<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card bg-dark text-white">
        <h5 class="card-header">Buy Ticket</h5>
        <div class="card-body">
          <p>Current winning price: {{currentWinningPrice}} SHFT</p>
          <form @submit.prevent="participate">
            <div class="form-group">
              <input
                type="text"
                class="form-control"
                id="playerName"
                placeholder="Input your name"
                v-model="playerName"
                required>
            </div>
            <div class="form-group">
              <label for="tickets">How many tickets want you to buy?</label>
              <input
                type="number"
                class="form-control"
                id="tickets"
                placeholder="How many tickets?"
                v-model="tickets"
                required>
            </div>
            <div class="form-group">
              <label for="coinsRequired">SHFT required to participate</label>
              <input
                type="text"
                class="form-control"
                id="coinsRequired"
                v-model="coinsRequired"
                disabled>
            </div>
            <button v-if="!showProgress" type="submit" class="btn btn-secondary px-4">Buy</button>
            <div v-if="error" class="alert alert-danger voffset2" role="alert">
              {{error}}
            </div>
            <div v-if="showProgress" class="progress voffset5" style="height: 30px">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                aria-valuemin="0"
                aria-valuemax="100"
                :style="{'width': '100%', 'font-size': '20px'}"
              >
                Buying...
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { eventBus } from "../main";

import web3 from "../web3/web3";
import Lottery from "../web3/Lottery";
import shftContract from "../web3/SHFTToken";

export default {
  props: ["lotteryAddress", "accounts"],
  data() {
    return {
      currentWinningPrice: 0,
      coinsRequired: 0,
      player: {},
      playerName: "",
      tickets: 1,
      error: null,
      showProgress: false,
    };
  },
  methods: {
    async participate() {
      this.coinsRequired = parseFloat(this.coinsRequired);
      // const decimal = await shftContract.methods.decimals().call();
      // console.log(decimal);
      // const amountDecimal = this.coinsRequired * 10**18;
      // const amountHex = "0x" + amountDecimal.toString(16);
      Lottery.methods
        .participate(this.playerName)
        .send({
          from: this.accounts[0],
          gas: "1000000",
          value: this.coinsRequired*this.tickets*10**18
        })
        .once("transactionHash", hash => {
          this.showProgress = true;
        })
        .on("error", error => {
          console.log(error);
          this.error =
            "There was an error while making transaction, please try again later.";
          this.showProgress = false;
        })
        .then(reciept => {
          eventBus.$emit(
            "playerParticipated",
            reciept.events.PlayerParticipated.returnValues
          );
          this.currentWinningPrice = parseFloat(this.coinsRequired) + parseFloat(this.currentWinningPrice);
          this.showProgress = false;
        });
    }
  },
  async created() {
    Lottery.options.address = this.lotteryAddress;
    Lottery.methods
      .coinsRequired()
      .call()
      .then(result => {
        this.coinsRequired = result;
      });
    Lottery.methods
      .getWinningPrice()
      .call()
      .then(result => {
        this.currentWinningPrice = result/10**18;
      });
    Lottery.methods
      .getPlayer(this.accounts[0])
      .call()
      .then(player => {
        this.player = player;
      });
  },
  mounted() {
  }
};
</script>

<style>

</style>
