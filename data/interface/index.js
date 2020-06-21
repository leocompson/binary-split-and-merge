var config  = {
  "resize": {"timeout": null},
  "split": {"buffers": [], "element": null},
  "merge": {"buffers": [], "element": null},
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
        var tmp = document.querySelector("input[type='radio']:checked");
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
        var tmp = config.storage.read("drop.bytes");
        /*  */
        if (tmp !== undefined) document.getElementById(tmp).checked = true;
        config.drop.size.value = config.storage.read("drop.size") !== undefined ? config.storage.read("drop.size") : '';
        config.drop.chunks.value = config.storage.read("drop.chunks") !== undefined ? config.storage.read("drop.chunks") : 2;
        config.drop.type.selectedIndex = config.storage.read("drop.type") !== undefined ? config.storage.read("drop.type") : 402;
        config.drop.extension.selectedIndex = config.storage.read("drop.extension") !== undefined ? config.storage.read("drop.extension") : 402;
      }
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {return config.storage.local[id]},
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          var tmp = {};
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
      fetch("resources/map.json").then(r => r.json()).then(e => {
        config.map.data = e;
        /*  */
        for (id in config.map.data) {
          for (var i = 0; i < config.map.data[id].length; i++) {
            var type = id;
            var extensions = config.map.data[type];
            /*  */
            var option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            config.drop.type.appendChild(option);
            /*  */
            var option = document.createElement("option");
            option.value = extensions[i];
            option.textContent = extensions[i];
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
    "file": null,
    "reader": null,
    "element": null,
    "extension": null,
    "async": {
      "read": function (file) {
        return new Promise((resolve, reject) => {
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
          var target = document.querySelector("input[type='radio']:checked");
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
          var result = {'a': null, 'b': null};
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
  "update": {
    "active": function () {
      var a = [...document.querySelectorAll(".actions table tr td div")];
      var b = [...document.querySelectorAll(".actions table tr td input")];
      var c = [...document.querySelectorAll(".actions table tr td label")];
      var d = [...document.querySelectorAll(".actions table tr td select")];
      //
      [...a, ...b, ...c, ...d].map(e => {
        e.disabled = true;
        e.closest("td").style.opacity = "0.50";
        e.closest("td").style.cursor = "not-allowed";
        e.closest("td").style.backgroundColor = "#ffffff";
      });
      /*  */
      var a = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) div")];
      var b = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) input")];
      var c = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) label")];
      var d = [...document.querySelectorAll(".actions[role='split'] table tr td:nth-child(1) select")];
      //
      [...a, ...b, ...c, ...d].map(e => {
        e.disabled = false;
        e.closest("td").style.opacity = "1.00";
        e.closest("td").style.cursor = "default";
        e.closest("td").style.backgroundColor = "#f5f5f5";
      });
      /*  */
      var a = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(3) div")];
      var b = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(3) input")];
      var c = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(3) label")];
      var d = [...document.querySelectorAll(".actions[role='merge'] table tr td:nth-child(3) select")];
      //
      [...a, ...b, ...c, ...d].map(e => {
        e.disabled = false;
        e.closest("td").style.opacity = "1.00";
        e.closest("td").style.cursor = "default";
        e.closest("td").style.backgroundColor = "#f5f5f5";
      });
    },
    "interface": function () {
      if (config.drop.current) {
        if (config.drop.current.type) {
          var ext = config.drop.current.name.split('.').pop();
          config.map.file.extension.to.mime.type[ext] = config.drop.current.type;
          var tmp = config.map.data[config.drop.current.type];
          if (tmp) {
            var index = tmp.indexOf(ext);
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
            var segment = config.drop.current.size / config.drop.chunks.value;
            var result = config.convert.bytes.to.filesize(segment);
            if (result) {
              config.drop.size.value = result.a;
              var target = document.querySelector("input[type='radio'][id='" + result.b.toLowerCase() + "']");
              if (target) target.checked = true;
            }
          } else if (config.drop.size.value) {
            var result = config.convert.filesize.to.bytes(config.drop.size.value);
            if (result) {
              var chunks = config.drop.current.size / result;
              config.drop.chunks.value = chunks;
            }
          }
        }
      }
      /*  */
      config.store.interface.metrics();
    }
  },
  "listeners": {
    "merge": async function () {
      if (config.merge.element.getAttribute("state") === "loading") return;
      config.merge.element.setAttribute("state", "loading");
      /*  */
      config.file.type = config.drop.type.value;
      config.file.extension = config.drop.extension.value;
      /*  */
      var extension = config.file.extension ? '.' + config.file.extension : '';
      var type = config.file.type ? config.file.type : "application/octet-stream";
      var blob = new Blob(config.merge.buffers, {"type": type});
      var url = URL.createObjectURL(blob);
      /*  */
      chrome.downloads.download({"url": url, "filename": "merged" + extension}, function () {
        URL.revokeObjectURL(url);
        config.merge.element.removeAttribute("state");
      });
    },
    "split": async function () {
      if (config.split.element.getAttribute("state") === "loading") return;
      config.split.element.setAttribute("state", "loading");
      /*  */
      var i, j, tmp, count = 0;
      var buffer = config.split.buffers[0];
      var chunks = config.drop.chunks.value;
      var bytes = Math.floor(buffer.byteLength / chunks);
      for (i = 0, j = buffer.byteLength; i < j; i += bytes) {
        count = count + 1;
        await new Promise(function(resolve) {
          /*  */
          tmp = buffer.slice(i, i + bytes);
          var blob = new Blob([tmp], {"type": "application/octet-stream"});
          var filename = config.file.name + ".part.00" + count;
          var url = URL.createObjectURL(blob);
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
    },
    "drop": async function () {
      var target = config.drop.element;
      if (target) {
        if (target.files) {
          config.drop.files = target.files;
          var actions = document.querySelector(".actions");
          /*  */
          var filesize = '', details = {'a': '', 'b': '', 'n': 0};
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
          for (var i = 0; i < config.drop.files.length; i++) {
            var file = config.drop.files[i];
            if (file && file.name) {       
              config.drop.current = file;
              config.file.type = config.drop.current.type;
              config.file.name = config.drop.current.name;
              var buffer = await config.drop.async.read(config.drop.current);
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

var load = function () {
  var reload = document.getElementById("reload");
  var support = document.getElementById("support");
  var donation = document.getElementById("donation");
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
  support.addEventListener("click", function () {
    var url = config.addon.homepage();
    chrome.tabs.create({"url": url, "active": true});
  }, false);
  /*  */
  donation.addEventListener("click", function () {
    var url = config.addon.homepage() + "?reason=support";
    chrome.tabs.create({"url": url, "active": true});
  }, false);
  /*  */
  config.storage.load(config.app.start);
  window.removeEventListener("load", load, false);
  reload.addEventListener("click", function (e) {document.location.reload()}, false);
};

window.addEventListener("resize", function () {
  if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
  config.resize.timeout = window.setTimeout(function () {
    config.storage.write("width", window.innerWidth || window.outerWidth);
    config.storage.write("height", window.innerHeight || window.outerHeight);
  }, 1000);
}, false);

window.addEventListener("load", load, false);
window.addEventListener("dragover", function (e) {e.preventDefault()});
window.addEventListener("drop", function (e) {if (e.target.id !== "fileio") e.preventDefault()});
