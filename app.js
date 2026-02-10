(function () {
  var timeEl = document.getElementById('time');
  var dateEl = document.getElementById('date');
  var weatherEl = document.getElementById('weather');
  var appEl = document.getElementById('app');
  var lastMinute = -1;

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function formatTime(d) {
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  function formatDate(d) {
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var w = d.getDay(); // 0..6
    var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return y + '-' + pad(m) + '-' + pad(day) + ' ' + weekdays[w];
  }

  function weatherText(code) {
    // WMO weather codes as used by Open-Meteo
    if (code === 0) return '晴';
    if (code === 1 || code === 2 || code === 3) return '多云';
    if (code === 45 || code === 48) return '有雾';
    if (code === 51 || code === 53 || code === 55) return '毛毛雨';
    if (code === 56 || code === 57) return '冻毛毛雨';
    if (code === 61 || code === 63 || code === 65) return '小雨/中雨';
    if (code === 66 || code === 67) return '冻雨';
    if (code === 71 || code === 73 || code === 75) return '小雪/中雪';
    if (code === 77) return '雪粒';
    if (code === 80 || code === 81 || code === 82) return '阵雨';
    if (code === 85 || code === 86) return '阵雪';
    if (code === 95) return '雷雨';
    if (code === 96 || code === 99) return '强雷雨';
    return '未知';
  }

  function weatherClass(code) {
    if (code === 0) return 'bg-sun';
    if (code === 1 || code === 2 || code === 3) return 'bg-cloud';
    if (code === 45 || code === 48) return 'bg-fog';
    if (code === 51 || code === 53 || code === 55) return 'bg-rain';
    if (code === 56 || code === 57) return 'bg-rain';
    if (code === 61 || code === 63 || code === 65) return 'bg-rain';
    if (code === 66 || code === 67) return 'bg-rain';
    if (code === 71 || code === 73 || code === 75) return 'bg-snow';
    if (code === 77) return 'bg-snow';
    if (code === 80 || code === 81 || code === 82) return 'bg-rain';
    if (code === 85 || code === 86) return 'bg-snow';
    if (code === 95 || code === 96 || code === 99) return 'bg-storm';
    return 'bg-cloud';
  }

  function fetchWeather() {
    if (!weatherEl) return;
    var url = 'https://a-epaudlaztu.cn-shenzhen.fcapp.run';

    weatherEl.textContent = '--℃ 请求中';
    var done = false;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 8000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      done = true;
      if (xhr.status !== 200) {
        weatherEl.textContent = '--℃ 网络错误';
        return;
      }
      try {
        var data = JSON.parse(xhr.responseText);
        var temp = data ? data.temp : undefined;
        var code = data ? data.code : undefined;
        if (!data || data.ok !== true || temp === undefined || code === undefined) {
          weatherEl.textContent = '--℃ 无数据';
          return;
        }
        var text = weatherText(code);
        weatherEl.textContent = temp + '℃ ' + text;
        if (appEl) {
          appEl.className = appEl.className.replace(/\\bbg-[a-z]+\\b/g, '').trim();
          var cls = weatherClass(code);
          appEl.className = (appEl.className + ' ' + cls).trim();
        }
      } catch (e) {
        weatherEl.textContent = '--℃ 解析失败';
      }
    };
    xhr.onerror = function () {
      done = true;
      weatherEl.textContent = '--℃ 网络错误';
    };
    xhr.ontimeout = function () {
      done = true;
      weatherEl.textContent = '--℃ 超时';
    };
    xhr.send(null);

    setTimeout(function () {
      if (!done) {
        weatherEl.textContent = '--℃ 无法连接';
      }
    }, 10000);
  }

  function drift() {
    // Small, slow movement to reduce burn-in
    var dx = Math.floor(Math.random() * 13) - 6; // -6..6
    var dy = Math.floor(Math.random() * 9) - 4;  // -4..4
    timeEl.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  }

  function tick() {
    var now = new Date();
    timeEl.textContent = formatTime(now);
    if (dateEl) dateEl.textContent = formatDate(now);

    if (now.getMinutes() !== lastMinute) {
      lastMinute = now.getMinutes();
      drift();
    }
  }

  function startAligned() {
    tick();
    fetchWeather();
    var now = new Date();
    var delay = 1000 - now.getMilliseconds();
    setTimeout(function () {
      tick();
      setInterval(tick, 1000);
    }, delay);
    setInterval(fetchWeather, 10 * 60 * 1000);
  }

  startAligned();
})();
