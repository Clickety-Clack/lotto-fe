<template>
  <div class="card">
    <div class="card-body">
      <form @submit.prevent="createLottery">
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right" for="valueName">{{labelName}}</label>
          <input
            type="text"
            class="form-control"
            id="valueName"
            v-model="valueName"
            required> 
        </div>
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right" for="valueEnd">{{labelEnd}}</label>
          <input
            type="datetime-local"
            class="form-control"
            id="valueEnd"
            v-model="valueEnd"
          >
          <div v-if="timeErr" class="alert alert-danger voffset2" role="alert">
            Must be future time.
          </div>
        </div>
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right" for="valueFee">{{labelFee}}</label>
          <input
            type="number"
            class="form-control"
            id="valueFee"
            v-model="valueFee"
          >
        </div>
        <div class="form-group d-flex align-items-center">
          <label class="col-md-6 text-right" for="valueCost">{{labelCost}}</label>
          <input
            class="form-control"
            id="valueCost"
            v-model="valueCost"
            :min=1
            @keypress="isNumber($event)"
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
          .createLottery(this.valueName, this.dateToStr(new Date(this.valueEnd)), this.valueFee, parseFloat(this.valueCost))
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
