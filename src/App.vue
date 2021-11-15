<template>
  <div id="app">
    <!-- <app-header class="header"></app-header> -->
    <div v-if="!isMetaMaskPresent" class="alert alert-danger err-msg" role="alert">
      Meta mask is not detected
      <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en-US" target="_blank">
        <button class="metamask-button">Add Metamaks</button>
      </a>
    </div>
    <div v-else-if="!isMetaMaskLoggedin" class="alert alert-danger err-msg" role="alert">
      Please log into Metamask
      <button @click="handleLoginMetamask" class="metamask-button">Login Metamask</button>
    </div>
    <div v-if="isMetaMaskPresent && isMetaMaskLoggedin" class="container p-3" style="min-height: 70vh">
      <router-view/>
    </div>
    <!-- <app-footer class="voffset3"></app-footer> -->
  </div>
</template>

<script>
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";

import web3 from "./web3/web3";

export default {
  data() {
    return {
      isMetaMaskPresent: false,
      isMetaMaskLoggedin: false,
    };
  },
  methods: {
    handleLoginMetamask() {
      ethereum.request({ method: 'eth_requestAccounts' });
    }
  },
  async created() {
    this.isMetaMaskPresent = web3 ? true : false;
    try {
      await ethereum.enable();
    } catch (error) {
    }
    if (this.isMetaMaskPresent) {
      const accounts = await web3.eth.getAccounts();
      this.isMetaMaskLoggedin = accounts.length ? true : false;
    }
  },
  components: {
    AppHeader: Header,
    AppFooter: Footer
  }
};
</script>

<style>
.metamask-button {
  background-color: transparent;
  color: white;
  border: 1px solid brown;
  border-radius: 5px;
  margin: 10px;
  color: brown;
  outline: none;
  cursor: pointer;
}

.metamask-button:hover {
  color: #aa4433;
}

.metamask-button:active {
  color: #993333;
}

.header {
  margin-bottom: 15px;
}

.err-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  font-size: 20px;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #333333;
  min-height: 100vh;
  background: linear-gradient(217deg, rgba(20,0,0,.9), rgba(255,0,0,0) 93.71%),
              linear-gradient(127deg, rgba(0,20,0,.9), rgba(0,255,0,0) 93.71%),
              linear-gradient(336deg, rgba(0,0,20,.9), rgba(0,0,255,0) 93.71%);
}

.voffset {
  margin-top: 2px;
}
.voffset1 {
  margin-top: 5px;
}
.voffset2 {
  margin-top: 10px;
}
.voffset3 {
  margin-top: 15px;
}
.voffset4 {
  margin-top: 30px;
}
.voffset5 {
  margin-top: 40px;
}
.voffset6 {
  margin-top: 60px;
}
.voffset7 {
  margin-top: 80px;
}
.voffset8 {
  margin-top: 100px;
}
.voffset9 {
  margin-top: 150px;
}
</style>
