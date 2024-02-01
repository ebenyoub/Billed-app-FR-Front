class Store {
    constructor() {
      this.api = () => Promise.resolve();
    }
  
    users = () => ({
      create: () => Promise.resolve({})
    });
  
    login = (data) => {
      return Promise.resolve({ jtw: "jtw"});
    }
  }
  
  export default new Store();