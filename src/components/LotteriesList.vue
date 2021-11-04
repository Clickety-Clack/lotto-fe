<template>
    <div>
      <div class="alert alert-danger" v-if="chainId != 7341">
        Connect to Shyft network!
      </div>
      <div v-if="chainId == 7341">
        <div class="row">
          <div class="col-md-10 offset-md-1">
            <create-lottery
              :accounts="accounts"
              :lotteryCreated="lotteryCreated"
            ></create-lottery>
          </div>
        </div>
        <!-- <div class="row voffset3">
          <lottery-head
            v-for="address in lotteries"
            :key="address"
            :lotteryAddress="address"
            :accounts="accounts"
          ></lottery-head>
        </div> -->
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
import LotteryHead from "./LotteryHead";
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
    lotteryCreated(lotteryAddress) {
      this.lotteries.push(lotteryAddress);
    },
  },
  components: {
    LotteryHead,
    CreateLottery,
  },
  async created() {
    this.chainId = await web3.eth.getChainId();
    if (this.chainId == 7341) {
      this.lotteries = await LotteryGenerator.methods.getLotteries().call();
      web3.eth.getAccounts().then(metaMaskAccounts => {
        this.accounts = metaMaskAccounts;
      });
      this.lotteries.forEach(async (lottery) => {
        Lottery.options.address = lottery;
        console.log(lottery);
        var lottery_name = await Lottery.methods.lotteryName().call();
        var lottery_end = await Lottery.methods.endAt().call();
        var lottery_fee = await Lottery.methods.creatorFee().call();
        var lottery_entry = await Lottery.methods.maxEntries().call();
        var lottery_amount = await Lottery.methods.coinsRequired().call();
        
        var new_lottery = {
          name: lottery_name,
          end: lottery_end,
          fee: lottery_fee,
          entry: lottery_entry,
          amount: lottery_amount
        };
        this.lotteryData.push(new_lottery);
      })
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
