<template>
  <div class="row">
      <div class="col-md-12">
          <div class="card bg-dark text-white">
              <h5 v-if="totalPlayers == 0 || totalPlayers == 1" class="card-header">{{totalPlayers}}&nbsp;Participant</h5>
              <h5 v-else class="card-header">{{totalPlayers}}&nbsp;Participants</h5>
              <div class="card-body">
                <ul class="list-group bg-secondary">
                    <li class="list-group-item bg-secondary" :key="address+''"
                      v-for="(player, address) in players">{{player[0]}} ({{player[1]}} tickets)</li>
                </ul>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import { eventBus } from "../main";
import Vue from "vue";
import Lottery from "../web3/Lottery";
export default {
  props: ["lotteryAddress", "accounts"],
  data() {
    return {
      totalPlayers: 0,
      players: {},
      playersAddresses: []
    };
  },
  async created() {
    this.playersAddresses = await Lottery.methods.getPlayers().call();
    this.totalPlayers = this.playersAddresses.length;
    this.playersAddresses.forEach(playerAddress => {
      Lottery.methods
        .getPlayer(playerAddress)
        .call()
        .then(result => {
          Vue.set(this.players, playerAddress, result);
        });
    });

    eventBus.$on("playerParticipated", result => {
      const player = {
        0: result.name,
        1: result.ticketCount
      };
      this.totalPlayers++;
      Vue.set(this.players, this.accounts[0], player);
    });
  }
};
</script>

<style>

</style>
