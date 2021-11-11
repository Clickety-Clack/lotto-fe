<template>
  <div class="card bg-dark text-secondary">
    <div class="card-header text-white">
      <h1>Create your own lotto!</h1>
    </div>
    <div class="card-body">
      <form @submit.prevent="createLottery">
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right text-white" for="valueName">{{labelName}}</label>
          <input
            type="text"
            class="form-control bg-transparent text-white"
            id="valueName"
            v-model="valueName"
            required> 
        </div>
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right text-white" for="valueEnd">{{labelEnd}}</label>
          <input
            type="datetime-local"
            class="form-control bg-transparent text-white"
            id="valueEnd"
            v-model="valueEnd"
          >
          <div v-if="timeErr" class="alert alert-danger voffset2" role="alert">
            Must be future time.
          </div>
        </div>
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right text-white" for="valueFee">{{labelFee}}</label>
          <input
            type="number"
            class="form-control bg-transparent text-white"
            id="valueFee"
            v-model="valueFee"
          >
        </div>
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right text-white" for="valueCost">{{labelCost}}</label>
          <input
            class="form-control bg-transparent text-white"
            id="valueCost"
            v-model="valueCost"
            :min=1
            @keypress="isNumber($event)"
          >
        </div>
        <button v-if="!isProgress" type="submit" class="btn btn-secondary px-5" :disabled="isProgress">Create</button>
      </form>
      <div v-if="showError" class="alert alert-danger voffset2" role="alert">
        There was an error while creating lottery, try again later.
      </div>
      <div v-if="isProgress" class="progress voffset2" style="height: 30px">
        <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          aria-valuemin="0"
          aria-valuemax="100"
          :style="{'width': '100%', 'font-size': '20px'}"
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
import {labels} from "../config";

export default {
  props: ["lotteryCreated", "accounts"],
  data: function() {
    return {
      labelName: labels.labelName,
      labelEnd: labels.labelEnd,
      labelFee: labels.labelFee,
      labelCost: labels.labelCost,
      valueName: "",
      valueEnd: "",
      valueFee: "",
      valueCost: "",
      lotteryName: "",
      showError: false,
      isProgress: false,
      timeErr: false
    };
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
    dateToStr: function(prop) {
      const year = prop.getFullYear();
      const month = (prop.getMonth()+1).toString().padStart(2, '0');
      const date = prop.getDate().toString().padStart(2, '0');
      const time = prop.getHours().toString().padStart(2, '0') + ':' + prop.getMinutes().toString().padStart(2, '0') + ':' + prop.getSeconds().toString().padStart(2, '0');
      const str = `${year}-${month}-${date} ${time}`;
      return str;
    },
    isValidDeadline: function(prop) {
      return new Date(prop).getTime() > new Date().getTime();
    },
    async createLottery() {
      this.timeErr = !this.isValidDeadline(this.valueEnd);
      if (!this.timeErr) {
        LotteryGenerator.methods
          .createLottery(this.valueName, this.dateToStr(new Date()), this.dateToStr(new Date(this.valueEnd)), this.valueFee, parseFloat(this.valueCost))
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
            this.lotteryCreated(reciept.events.LotteryCreated.returnValues.lotteryAddress);
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
