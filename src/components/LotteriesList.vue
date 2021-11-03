<template>
    <div>
      <div class="alert alert-danger" v-if="chainId != 7341">
        Connect to Shyft network!
      </div>
      <div v-if="chainId == 7341">
        <div class="row">
          <div class="col-md-4 offset-md-4">
            <create-lottery
              :accounts="accounts"
              :lotteryCreated="lotteryCreated"
            ></create-lottery>
          </div>
        </div>
        <div class="row voffset3">
          <lottery-head
            v-for="address in lotteries"
            :key="address"
            :lotteryAddress="address"
            :accounts="accounts"
          ></lottery-head>
        </div>
      </div>
    </div>
</template>

<script>
import LotteryHead from "./LotteryHead";
import LotteryGenerator from "../web3/LotteryGenerator";
import CreateLottery from "./CreateLottery";

import web3 from '../web3/web3';

export default {
  data: function() {
    return {
      lotteries: [],
      accounts: [],
      chainId: 0,
    };
  },
  methods: {
    lotteryCreated(lotteryAddress) {
      this.lotteries.push(lotteryAddress);
    }
  },
  components: {
    LotteryHead,
    CreateLottery
  },
  async created() {
    this.chainId = await web3.eth.getChainId();
    if (this.chainId == 7341) {
      this.lotteries = await LotteryGenerator.methods.getLotteries().call();
      web3.eth.getAccounts().then(metaMaskAccounts => {
        this.accounts = metaMaskAccounts;
      });
    }
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

</style>
