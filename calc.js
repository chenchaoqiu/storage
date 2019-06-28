var localStorages = {
  set(key, value, time, status) {
    /* new Date().getTime(); 3600000 * 12 * 7 */
    time = time || 1;
    localStorage.setItem(key, JSON.stringify([value, (status ? time : (new Date().getTime() + 3600000 * 12 * time))]));
  },
  get(key) {
    const val = JSON.parse(localStorage.getItem(key));
    if (!val) { return }
    if (new Date().getTime() <= val[1]) {
      return [JSON.stringify(val[0]),val[1]];
    }
    this.remove(key);
  },
  remove(key) {
    delete localStorage[key];
  }
};

var TokenKey = 'session'

function getToken(Key) {
  return localStorages.get(Key || TokenKey);
}

function setToken(Key, token, time, status) {
  return localStorages.set(Key || TokenKey, token, time, status);
}

function removeToken(Key) {
  return localStorages.remove(Key || TokenKey);
}
