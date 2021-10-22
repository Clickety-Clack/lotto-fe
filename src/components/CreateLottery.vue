<template>
  <div class="card">
    <div class="card-body">
      <form @submit.prevent="createLottery">
        <div class="form-group">
          <label for="lotteryName">Create a Lottery</label>
          <input
            type="text"
            class="form-control"
            id="lotteryName"
            placeholder="Enter Lottery name"
            v-model="lotteryName"
            required> 
        </div>
        <div class="form-group">
          <label for="endDateString">How long till winner is picked</label>
          <input
            type="datetime-local"
            class="form-control"
            id="endDateString"
            v-model="endDateString"
          >
          <div v-if="timeErr" class="alert alert-danger voffset2" role="alert">
            Must be future time.
          </div>
        </div>
        <div class="form-group">
          <label for="creatorFee">How much % of winning goes back to creator</label>
          <input
            type="number"
            class="form-control"
            id="creatorFee"
            v-model="creatorFee"
          >
        </div>
        <button type="submit" class="btn btn-success">Create</button>
      </form>
      <div v-if="showError" class="alert alert-danger voffset2" role="alert">
        There was an error while creating lottery, try again later.
      </div>
      <div v-if="isProgress" class="progress voffset2">
        <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="{'width': '100%'}"
        >
          Creating...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import web3 from "../web3/web3";
import LotteryGenerator from "../web3/LotteryGenerator";

export default {
  props: ["lotteryCreated", "accounts"],
  data: function() {
    return {
      lotteryName: "",
      showError: false,
      isProgress: false,
      endDate: null,
      endDateString: null,
      creatorFee: 0,
      timeErr: false
    };
  },
  methods: {
    async createLottery() {
      this.endDate = new Date(this.endDateString);
      this.timeErr = this.endDate.getTime() < new Date().getTime();
      if (!this.timeErr) {
        const year = this.endDate.getFullYear();
        const month = (this.endDate.getMonth()+1).toString().padStart(2, '0');
        const date = this.endDate.getDate().toString().padStart(2, '0');
        const time = this.endDate.getHours().toString().padStart(2, '0') + ':' + this.endDate.getMinutes().toString().padStart(2, '0') + ':' + this.endDate.getSeconds().toString().padStart(2, '0');
        const strDate = `${year}-${month}-${date} ${time}`;
        LotteryGenerator.methods
          .createLottery(this.lotteryName, strDate, this.creatorFee)
          .send({
            gas: 2000000,
            from: this.accounts[0]
          })
          .once('transactionHash', (hash)=> {
            this.isProgress = true;
          })
          .on('error', (error)=>{
            console.log(error);
            this.showError = true
            this.isProgress = false;
          })
          .then((reciept) => {
            this.isProgress = false;
            this.lotteryCreated(reciept.events.LotteryCreated.returnValues.lotteryAddress)
          });
        }
    }
  },
  mounted() {
  }
};
</script>

<style>

</style>
