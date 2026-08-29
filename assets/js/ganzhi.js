/**
 * 干支纪年计算模块
 * 公元年份转干支纪年
 */
const Ganzhi = (function() {
  const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

  function getGanzhi(year) {
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;
    return TIANGAN[ganIndex] + DIZHI[zhiIndex];
  }

  function getShengxiao(year) {
    const index = (year - 4) % 12;
    return SHENGXIAO[index];
  }

  function getGanzhiWithShengxiao(year) {
    return getGanzhi(year) + '年（' + getShengxiao(year) + '年）';
  }

  return {
    getGanzhi,
    getShengxiao,
    getGanzhiWithShengxiao
  };
})();
