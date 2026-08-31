/**
 * 干支纪年月日时计算模块 - 修复版
 * 修复：年干支公式 year-3 → year-4（0-based索引修正）
 * 修复：近似农历月加入节气日判断
 * 天干：甲乙丙丁戊己庚辛壬癸
 * 地支：子丑寅卯辰巳午未申酉戌亥
 */
const Ganzhi = (() => {
  const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const DIZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  // 五虎遁：年干推正月月干
  const WUHU = {
    '甲':'丙','己':'丙',
    '乙':'戊','庚':'戊',
    '丙':'庚','辛':'庚',
    '丁':'壬','壬':'壬',
    '戊':'甲','癸':'甲'
  };
  // 五鼠遁：日干推子时时干
  const WUSHU = {
    '甲':'甲','己':'甲',
    '乙':'丙','庚':'丙',
    '丙':'戊','辛':'戊',
    '丁':'庚','壬':'庚',
    '戊':'壬','癸':'壬'
  };
  /**
   * 年干支
   * 修复：0-based索引用 (year-4)，公元4年=甲子年(idx=0)
   * 知乎公式 (year-3) 是1-based的，余数1=甲，不能直接索引0-based数组
   */
  function getYearGanzhi(year) {
    const idx = ((year - 4) % 60 + 60) % 60;
    return {
      gan: TIANGAN[idx % 10],
      zhi: DIZHI[idx % 12],
      zodiac: ZODIAC[idx % 12],
      full: TIANGAN[idx % 10] + DIZHI[idx % 12] + '年',
      short: TIANGAN[idx % 10] + DIZHI[idx % 12]
    };
  }
  /**
   * 月干支
   * @param {string} yearGan - 年干（甲乙丙丁...）
   * @param {number} lunarMonth - 干支月序号，1=寅月(正月)，2=卯月...12=丑月
   */
  function getMonthGanzhi(yearGan, lunarMonth) {
    const startGan = WUHU[yearGan];
    const startIdx = TIANGAN.indexOf(startGan);
    const monthIdx = ((lunarMonth - 1) % 12 + 12) % 12; // 寅月=0
    const ganIdx = (startIdx + monthIdx) % 10;
    const zhiIdx = (monthIdx + 2) % 12; // 寅=2
    return {
      gan: TIANGAN[ganIdx],
      zhi: DIZHI[zhiIdx],
      full: TIANGAN[ganIdx] + DIZHI[zhiIdx] + '月',
      short: TIANGAN[ganIdx] + DIZHI[zhiIdx]
    };
  }
  /**
   * 日干支
   * 基准：2000年1月1日 = 戊午日（60甲子序=54）
   * 验证：1900-01-01甲戌(序10) + 36524天 = 2000-01-01戊午(序54) ✓
   */
  function getDayGanzhi(date) {
    const base = new Date(2000, 0, 1);
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((target - base) / 86400000);
    const idx = ((54 + diffDays) % 60 + 60) % 60;
    return {
      gan: TIANGAN[idx % 10],
      zhi: DIZHI[idx % 12],
      full: TIANGAN[idx % 10] + DIZHI[idx % 12] + '日',
      short: TIANGAN[idx % 10] + DIZHI[idx % 12]
    };
  }
  /**
   * 时干支
   * @param {string} dayGan - 日干
   * @param {number} hour - 小时(0-23)，23点起算子时
   */
  function getHourGanzhi(dayGan, hour) {
    let shiIdx;
    if (hour === 23 || hour === 0) shiIdx = 0; // 子时
    else shiIdx = Math.floor((hour + 1) / 2);
    const startGan = WUSHU[dayGan];
    const startIdx = TIANGAN.indexOf(startGan);
    const ganIdx = (startIdx + shiIdx) % 10;
    return {
      gan: TIANGAN[ganIdx],
      zhi: DIZHI[shiIdx],
      full: TIANGAN[ganIdx] + DIZHI[shiIdx] + '时',
      short: TIANGAN[ganIdx] + DIZHI[shiIdx]
    };
  }
  /**
   * 公历转近似干支月（含节气日修正）
   * 节气日为近似值，每年实际差1-2天
   * 精确版需要二十四节气天文算法
   */
  function getApproxLunarMonth(date) {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    // 各月节气日（近似）：1月小寒6号，2月立春4号，3月惊蛰6号...
    const jieqiDay = [0, 6, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7];
    let gzMonth; // 干支月对应的公历月
    if (day < jieqiDay[month]) {
      gzMonth = month - 1; // 节气前，还是上一个月
    } else {
      gzMonth = month;
    }
    if (gzMonth <= 0) gzMonth += 12;
    // 公历月 → 干支月序号(1=寅月)
    // 公历2月(立春后)=寅月(1)，公历1月(小寒后)=丑月(12)
    return ((gzMonth - 2 + 12) % 12) + 1;
  }
  /**
   * 完整干支日期
   */
  function getFullGanzhi(dateStr, config = {}) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const yearGZ = getYearGanzhi(year);
    const lunarMonth = getApproxLunarMonth(date);
    const monthGZ = getMonthGanzhi(yearGZ.gan, lunarMonth);
    const dayGZ = getDayGanzhi(date);
    const hourGZ = getHourGanzhi(dayGZ.gan, date.getHours());
    let result = '';
    if (config.showYear !== false) result += yearGZ.full;
    if (config.showMonth !== false) result += monthGZ.full;
    if (config.showDay !== false) result += dayGZ.full;
    if (config.showHour) result += hourGZ.full;
    if (config.showZodiac) result += `（${yearGZ.zodiac}年）`;
    return {
      year: yearGZ,
      month: monthGZ,
      day: dayGZ,
      hour: hourGZ,
      zodiac: yearGZ.zodiac,
      lunarMonth,
      full: result,
      short: `${yearGZ.short}年${monthGZ.short}月${dayGZ.short}日`
    };
  }
  return {
    TIANGAN, DIZHI, ZODIAC,
    getYearGanzhi, getMonthGanzhi, getDayGanzhi, getHourGanzhi,
    getFullGanzhi, getApproxLunarMonth
  };
})();
// 浏览器全局
if (typeof window !== 'undefined') window.Ganzhi = Ganzhi;
