//
// Hybridcast Connect Javascript SDK
// npm package index, API wrapper
//

const hyconet = require("./hyconet.js")

// TBD: ここでutilとかhelper系処理を、
// コア実装に挟んだり、設定変えたりできるようにする
// 例1: debug設定とか、default値（処理）などを差し替える
// hyconet.logger.debugmode = "info" | "warning" | "debug"
// 例2: antwappのような規格ではないものはデバッガの一部のhelper処理として実装して、
// index.jsでON/OFF切り替えできるようにする
// hyconet.helper.emulator = "disable" // antwappをサーチ対象から外す設定

module.exports = hyconet
