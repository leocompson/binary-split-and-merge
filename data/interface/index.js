var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "connect": function (port) {
    chrome.runtime.onMessage.addListener(background.listener); 
    /*  */
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "send": function (id, data) {
    if (id) {
      if (context !== "webapp") {
        chrome.runtime.sendMessage({
          "method": id,
          "data": data,
          "path": "interface-to-background"
        }, function () {
          return chrome.runtime.lastError;
        });
      }
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "port": background.port.name,
          "path": "interface-to-background"
        });
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (let id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-interface") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var config  = {
  "split": {
    "buffers": [], 
    "element": null
  },
  "merge": {
    "buffers": [], 
    "element": null
  },
  "file": {
    "type": null, 
    "name": null,
    "extension": null
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "map": {
    "data": {},
    "file": {
      "extension": {
        "to": {
          "mime": {
            "type": {}
          }
        }
      }
    }
  },
  "store": {
    "interface": {
      "metrics": function () {
        const tmp = document.querySelector("input[type='radio']:checked");
        /*  */
        if (tmp) config.storage.write("drop.bytes", tmp.id);
        config.storage.write("drop.size", config.drop.size.value);
        config.storage.write("drop.chunks", config.drop.chunks.value);
        config.storage.write("drop.type", config.drop.type.selectedIndex);
        config.storage.write("drop.extension", config.drop.extension.selectedIndex);
      }
    }
  },
  "retrieve": {
    "interface": {
      "metrics": function () {
        const tmp = config.storage.read("drop.bytes");
        /*  */
        if (tmp !== undefined) document.getElementById(tmp).checked = true;
        config.drop.size.value = config.storage.read("drop.size") !== undefined ? config.storage.read("drop.size") : '';
        config.drop.chunks.value = config.storage.read("drop.chunks") !== undefined ? config.storage.read("drop.chunks") : 2;
        config.drop.type.selectedIndex = config.storage.read("drop.type") !== undefined ? config.storage.read("drop.type") : 402;
        config.drop.extension.selectedIndex = config.storage.read("drop.extension") !== undefined ? config.storage.read("drop.extension") : 402;
      }
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?win") config.port.name = "win";
            background.connect(chrome.runtime.connect({"name": config.port.name}));
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "app": {
    "start": function () {
      const theme = config.storage.read("theme");
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("theme", theme !== undefined ? theme : (dark ? "dark" : "light"));
      /*  */
      fetch("resources/map.json").then(r => r.json()).then(e => {
        config.map.data = e;
        /*  */
        for (id in config.map.data) {
          for (let i = 0; i < config.map.data[id].length; i++) {
            let extensions = config.map.data[id];
            let extension = extensions[i];
            let type = id;
            /*  */
            var option = document.createElement("option");
            option.value = type;
            option.textContent = type + ' >> ' + extension;
            config.drop.type.appendChild(option);
            /*  */
            var option = document.createElement("option");
            option.value = extension;
            option.textContent = extension + ' >> ' + type;
            config.drop.extension.appendChild(option);
          }
        }
        /*  */
        config.retrieve.interface.metrics();
      });
    }
  },
  "drop": {
    "chunks": 2,
    "type": null,
    "size": null,
    "files": null,
    "reader": null,
    "element": null,
    "extension": null,
    "async": {
      "read": function (file) {
        return new Promise((resolve) => {
          config.drop.reader = new FileReader();
          config.drop.reader.onload = function (e) {
            if (e && e.target) {
              if (e.target.result) {
                resolve(e.target.result);
              }
            }
          };
          /*  */
          config.drop.reader.readAsArrayBuffer(file);
        });
      }
    }
  },
  "convert": {
    "filesize": {
      "to": {
        "bytes": function (s) {
          const target = document.querySelector("input[type='radio']:checked");
          if (target) {
            if (target.id === "b") return s.toFixed(2);
            if (target.id === "kb") return (s * Math.pow(2, 10)).toFixed(2);
            if (target.id === "mb") return (s * Math.pow(2, 20)).toFixed(2);
            if (target.id === "gb") return (s * Math.pow(2, 30)).toFixed(2);
          }
        }
      }
    },
    "bytes": {
      "to": {
        "filesize": function (s) {
          const result = {'a': null, 'b': null};
          if (s) {
            if (s >= Math.pow(2, 30)) {
              result.b = "GB";
              result.a = (s / Math.pow(2, 30)).toFixed(2); 
            } else if (s >= Math.pow(2, 20)) {
              result.b = "MB";
              result.a = (s / Math.pow(2, 20)).toFixed(2); 
            } else if (s >= Math.pow(2, 10)) {
              result.b = "KB";
              result.a = (s / Math.pow(2, 10)).toFixed(2); 
            } else {
              result.b = "B";
              result.a = s.toFixed(2);
            };
          }
          /*  */
          return result;
        }
      }
    }
  },
  "load": function () {
    const theme = document.getElementById("theme");
    const reload = document.getElementById("reload");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    /*  */
    config.drop.size = document.getElementById("filesize");
    config.drop.type = document.getElementById("filetype");
    config.drop.chunks = document.getElementById("chunks");
    config.split.element = document.getElementById("split");
    config.merge.element = document.getElementById("merge");
    config.drop.element = document.getElementById("fileio");
    config.drop.extension = document.getElementById("fileextension");
    config.drop.radio = [...document.querySelectorAll("input[type=radio]")];
    /*  */
    config.drop.element.addEventListener("change", config.listeners.drop, false);
    config.split.element.addEventListener("click", config.listeners.split, false);
    config.merge.element.addEventListener("click", config.listeners.merge, false);
    /*  */
    reload.addEventListener("click", function () {
      document.location.reload();
    }, false);
    /*  */
    support.addEventListener("click", function () {
      const url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      const url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    config.drop.type.addEventListener("change", function (e) {
      config.drop.extension.selectedIndex = e.target.selectedIndex;
      config.store.interface.metrics();
    }, false);
    /*  */
    config.drop.extension.addEventListener("change", function (e) {
      config.drop.type.selectedIndex = e.target.selectedIndex;
      config.store.interface.metrics();
    }, false);
    /*  */
    config.drop.chunks.addEventListener("change", function () {
      config.drop.radio.map(e => {e.checked = false});
      config.drop.size.value = '';
      config.update.interface();
    }, false);
    /*  */
    config.drop.size.addEventListener("change", function () {
      config.drop.chunks.value = '';
      config.update.interface();
    }, false);
    /*  */
    config.drop.radio.map(function (e) {
      e.addEventListener("change", function () {
        config.drop.chunks.value = '';
        config.update.interface();
      }, false);
    });
    /*  */
    theme.addEventListener("click", function () {
      let attribute = document.documentElement.getAttribute("theme");
      attribute = attribute === "dark" ? "light" : "dark";
      /*  */
      document.documentElement.setAttribute("theme", attribute);
      config.storage.write("theme", attribute);
    }, false);
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "update": {
    "interface": function () {
      if (config.drop.current) {
        if (config.drop.current.type) {
          const ext = config.drop.current.name.split('.').pop();
          config.map.file.extension.to.mime.type[ext] = config.drop.current.type;
          const tmp = config.map.data[config.drop.current.type];
          if (tmp) {
            const index = tmp.indexOf(ext);
            if (index !== -1) {
              config.drop.type.value = config.drop.current.type;
              config.drop.extension.value = tmp[index];
            }
          }
        }
      }
      /*  */
      if (config.drop.files) {
        if (config.drop.files.length === 1) {
          if (config.drop.chunks.value) {
            const segment = config.drop.current.size / config.drop.chunks.value;
            /*  */
            const result = config.convert.bytes.to.filesize(segment);
            if (result) {
              config.drop.size.value = result.a;
              const target = document.querySelector("input[type='radio'][id='" + result.b.toLowerCase() + "']");
              if (target) target.checked = true;
            }
          } else if (config.drop.size.value) {
            const result = config.convert.filesize.to.bytes(config.drop.size.value);
            if (result) {
              const chunks = config.drop.current.size / result;
              config.drop.chunks.value = chunks;
            }
          }
        }
      }
      /*  */
      config.store.interface.metrics();
    },
    "active": function () {
      let a = [], b = [], c = [], d = [];
      let attribute = document.documentElement.getAttribute("theme");
      //
      a = [...document.querySelectorAll(".actions table tr td div")];
      b = [...document.querySelectorAll(".actions table tr td input")];
      c = [...document.querySelectorAll(".actions table tr td label")];
      d = [...document.querySelectorAll(".actions table tr td select")];
      //
      [...a, ...b, ...c, ...d].map(e => {
        e.disabled = true;
        e.closest("td").style.opacity = "0.50";
        e.closest("td").style.fontWeight = "normal";
        e.closest("td").style.cursor = "not-allowed";
        e.closest("td").style.backgroundColor = attribute === "dark" ? "#333333" : "#ffffff";
      });
      /*  */
      a = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) div")];
      b = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) input")];
      c = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) label")];
      d = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) select")];
      //
      [...a, ...b, ...c, ...d].map(e => {
        e.disabled = false;
        e.closest("td").style.opacity = "1.00";
        e.closest("td").style.cursor = "default";
        e.closest("td").style.fontWeight = "600";
        e.closest("td").style.backgroundColor = attribute === "dark" ? "#272727" : "#f5f5f5";
      });
      /*  */
      a = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(2) div")];
      b = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(2) input")];
      c = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(2) label")];
      d = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(2) select")];
      //
      [...a, ...b, ...c, ...d].map(e => {
        e.disabled = false;
        e.closest("td").style.opacity = "1.00";
        e.closest("td").style.cursor = "default";
        e.closest("td").style.fontWeight = "600";
        e.closest("td").style.backgroundColor = attribute === "dark" ? "#272727" : "#f5f5f5";
      });
    }
  },
  "listeners": {
    "merge": async function () {
      if (config.merge.element.getAttribute("state") === "loading") return;
      if (config.drop.current === undefined) return window.alert("Please add a file(s) and try again.");
      /*  */
      config.file.type = config.drop.type.value;
      config.file.extension = config.drop.extension.value;
      config.merge.element.setAttribute("state", "loading");
      /*  */
      const extension = config.file.extension ? '.' + config.file.extension : '';
      const type = config.file.type ? config.file.type : "application/octet-stream";
      const blob = new Blob(config.merge.buffers, {"type": type});
      const url = URL.createObjectURL(blob);
      /*  */
      chrome.downloads.download({"url": url, "filename": "merged" + extension}, function () {
        URL.revokeObjectURL(url);
        config.merge.element.removeAttribute("state");
      });
    },
    "split": async function () {
      if (config.split.element.getAttribute("state") === "loading") return;
      if (config.drop.current === undefined) return window.alert("Please add a file(s) and try again.");
      /*  */
      let i, j, tmp, count = 0;
      let buffer = config.split.buffers[0];
      let chunks = config.drop.chunks.value;
      /*  */
      if (buffer && chunks) {
        let bytes = Math.floor(buffer.byteLength / chunks);
        config.split.element.setAttribute("state", "loading");
        /*  */
        for (i = 0, j = buffer.byteLength; i < j; i += bytes) {
          count = count + 1;
          await new Promise(function(resolve) {
            /*  */
            tmp = buffer.slice(i, i + bytes);
            const blob = new Blob([tmp], {"type": "application/octet-stream"});
            const filename = config.file.name + ".part.00" + count;
            const url = URL.createObjectURL(blob);
            /*  */
            chrome.downloads.download({"url": url, "filename": filename}, function () {
              URL.revokeObjectURL(url);
              window.setTimeout(resolve, 300);
              config.split.element.removeAttribute("state");
            });
          });
        }
        /*  */
        config.store.interface.metrics();
      }
    },
    "drop": async function () {
      const target = config.drop.element;
      if (target) {
        if (target.files) {
          config.drop.files = target.files;
          const actions = document.querySelector(".actions");
          /*  */
          let filesize = '', details = {'a': '', 'b': '', 'n': 0};
          filesize = config.convert.bytes.to.filesize(config.drop.files[0].size);
          details.a = config.drop.files[0].name + " - " + filesize.a + filesize.b;
          filesize = config.convert.bytes.to.filesize([...config.drop.files].reduce((sum, e) => {return sum + (e ? e.size : 0)}, 0));
          details.b = config.drop.files.length + " files - total " + filesize.a + filesize.b;
          document.querySelector(".details").textContent = config.drop.files.length === 1 ? details.a : details.b;
          /*  */
          config[config.drop.files.length === 1 ? "split" : "merge"].element.setAttribute("state", "loading");
          actions.setAttribute("role", config.drop.files.length === 1 ? "split" : "merge");
          config[config.drop.files.length === 1 ? "split" : "merge"].buffers = [];
          document.querySelector("#fileio").style.cursor = "not-allowed";
          document.querySelector("#fileio").style.opacity = "0.75";
          target.disabled = true;
          config.update.active();
          /*  */
          for (let i = 0; i < config.drop.files.length; i++) {
            const file = config.drop.files[i];
            if (file && file.name) {
              config.drop.current = file;
              config.file.type = config.drop.current.type;
              config.file.name = config.drop.current.name;
              const buffer = await config.drop.async.read(config.drop.current);
              if (buffer) {
                config.update.interface();
                config[config.drop.files.length === 1 ? "split" : "merge"].buffers.push(buffer);
              }
            }
          }
          /*  */
          target.disabled = false;
          document.querySelector("#fileio").style.opacity = "1.00";
          document.querySelector("#fileio").style.cursor = "default";
          config[config.drop.files.length === 1 ? "split" : "merge"].element.removeAttribute("state");
        }
      }
      /*  */
      config.store.interface.metrics();
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
window.addEventListener("dragover", function (e) {e.preventDefault()});
window.addEventListener("drop", function (e) {if (e.target.id !== "fileio") e.preventDefault()});
