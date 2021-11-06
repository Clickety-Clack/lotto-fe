<template>
    <div>
      <div v-if="chainId != 7341">
        <div class="alert alert-danger">
          Connect to Shyft network!
        </div>
        <div>
          <h3>Please add shyft network to your metamask.</h3>
          <p>
            <b>Network Name</b>
            Shyft Main
          </p>
          <p>
            <b>New RPC URL</b>
            https://rpc.shyft.network:64738
          </p>
          <p>
            <b>Chain ID</b>
            7341
          </p>
          <p>
            <b>Currency Symbol(optional)</b>
            SHFT
          </p>
        </div>
      </div>
      <div v-if="chainId == 7341">
        <div class="row">
          <!-- <div v-for="l in lotteryData" :key="l.id">{{l.name}}</div> -->
          <div class="col-md-10 offset-md-1">
            <create-lottery
              :accounts="accounts"
              :lotteryCreated="lotteryCreated"
            ></create-lottery>
          </div>
        </div>
        <div class="row voffset3">
          <b-table
            striped
            hover
            outlined
            :fields="lotteryFields"
            :items="lotteryData"
            :filter="filter"
          >
            <template #cell(index)="data">
              {{ data.index + 1 }}
            </template>
            <template #cell(Detail)="data">
              <router-link
                :to="{
                  name: 'Lottery',
                  params: {lotteryAddress: lotteries[data.index]}
                }"
                class="btn btn-primary"
              >
                Show
              </router-link>
            </template>
          </b-table>
        </div>
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
      filter: "",
      isLottery: false,
      lotteryFields: [
        'index',
        { key: 'name', label: 'Name' },
        { key: 'end', label: 'End' },
        { key: 'fee', label: 'Fee' },
        { key: 'entry', label: 'Entry' },
        { key: 'amount', label: 'Amount' },
        'Detail',
      ],
      lotteryData: [],
    };
  },
  methods: {
    async lotteryCreated(lotteryAddress) {
      this.lotteries.push(lotteryAddress);
      this.addLottery(lotteryAddress);
    },
    addLottery(lottery) {
      Lottery.options.address = lottery;
      var new_lottery = { name: "", end: "", fee: 0, entry: 0, amount: 0 };
      Lottery.methods.lotteryName().call().then((result) => {
        new_lottery.name = result;
      });
      Lottery.methods.endAt().call().then((result) => {
        new_lottery.end = result;
      });
      Lottery.methods.creatorFee().call().then((result) => {
        new_lottery.fee = result;
      });
      Lottery.methods.maxEntries().call().then((result) => {
        new_lottery.entry = result;
      });
      Lottery.methods.coinsRequired().call().then((result) => {
        new_lottery.amount = result;
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
        LotteryGenerator.methods.getLotteries().call().then((result) => {
          this.lotteries = result;
          this.lotteries.forEach((lottery) => {
            this.addLottery(lottery);
          });
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

</style>
