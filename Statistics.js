import Models from "./QueryBuilder"
const sqlite3 = require('sqlite3').verbose();
const dbPath = 'C:/PosalonData/store-001.db';
class Statistics {

    static base_state_no = 0;
    static base_state_yes = 1;
    static base_type_number = -1;
    static base_type_price = -2;

    //支付状态0待支付1已支付2挂单3作废4取消5已退款(全部)6部分退款
    static order_pay_state_unpaid = 0 //待支付
    static order_pay_state_paid = 1 //已支付
    static order_pay_state_pending_order = 2 //挂单
    static order_pay_state_void = 3 //作废
    static order_pay_state_cancel = 4 //取消
    static order_pay_state_refunded = 5 //已退款
    static order_pay_state_portion_refunded = 6 //部分退款

    //账单表 支付类型0现金1信用卡2会员卡3礼品卡
    /** 支付类型 现金 */
    static order_bills_pay_type_cash = 0;
    /** 支付类型 信用卡 */
    static order_bills_pay_card = 1;
    /** 支付类型 会员卡 */
    static order_bills_pay_member = 2;
    /** 支付类型 礼品卡 */
    static order_bills_pay_gift = 3;

    //会员卡充值记录

    /** 支付类型-充值 */
    static order_member_cards_pay_type_cz = 0
    /** 支付类型-消费 */
    static order_member_cards_pay_type_xf = 1
    /** 支付类型-退款 */
    static order_member_cards_pay_type_refund = 2

    static refund_fun_cash = 0;
    static refund_fun_card = 1;
    static refund_fun_member = 2;
    static refund_fun_gift = 3;

    //退款原因类型0其他1服务2商品3健康4操作失误
    static refund_cause_no = 0;
    static refund_cause_serve = 1;
    static refund_cause_goods = 2;
    static refund_cause_jk = 3;
    static refund_cause_action = 4;

    constructor(begin_time = undefined, end_time = undefined) {
        if (begin_time != undefined) {
            this.begin_time = this.addDefaultTimeIfNeeded(begin_time, true);
        } else {
            this.begin_time = ''

        }
        if (end_time != undefined) {
            this.end_time = this.addDefaultTimeIfNeeded(end_time, false);

        } else {
            this.end_time = ''
        }
    }
    



    setDateTime(begin_time = undefined, end_time = undefined) {
        if (begin_time != undefined) {
            this.begin_time = this.addDefaultTimeIfNeeded(begin_time, true);
        } else {
            this.begin_time = ''

        }
        if (end_time != undefined) {
            this.end_time = this.addDefaultTimeIfNeeded(end_time, false);

        } else {
            this.end_time = ''
        }
        return this;
    }
    addDefaultTimeIfNeeded(time, isStartTime) {
        // 判断是否只有日期（形如 "YYYY-MM-DD"）
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (datePattern.test(time)) {
            return isStartTime ? `${time} 00:00:00` : `${time} 23:59:59`;
        }
        return time;
    }
    calculateCompletionRate(completedTasks, totalTasks) {
        let rate = (completedTasks / totalTasks) * 100;
        return rate.toFixed(2) + '%';  // 返回两位小数的百分比形式
    }
    // 获取当天的开始时间
    getStartOfToday() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return this.formatDate(date);
    }

    // 获取当天的结束时间
    getEndOfToday() {
        const date = new Date();
        date.setHours(23, 59, 59, 999);
        return this.formatDate(date);
    }
    //获取平均值
    calculateAverage(arr) {
        // 检查数组是否为空
        if (arr.length === 0) return 0;
        // 使用reduce函数求和，然后除以数组的长度
        return arr.reduce((sum, current) => sum + current, 0) / arr.length;
    }

    // 格式化日期为 "YYYY-mm-dd HH:ii:ss"
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    async TipTotal() {
        var th = this;
        var sql = Models.tableName('orders')
            .select(['sum(tip_total) as total'])
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        var res = await this._query(sql);
        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }

    async TaxTotal() {
        var th = this;
        var sql = Models.tableName('orders')
            .select(['sum(tax_total) as total'])
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }
    async DiscountsTotal() {
        var th = this;
        var sql = Models.tableName('orders')
            .select(['sum(discounts_total) as total'])
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }


    //-------------------------净营业额-----------------------
    //净营业额公用条件sql
    async BaseTurnoverSql(type) {
        
        var th = this;
        var sql = Models.tableName('orders')
            .select('SUM(order_bills.price) as total')
            .join('order_bills', { 'orders.id': 'order_bills.orders_id' })
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .where('order_bills.pay_type', type)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }
    /** 净营业额-现金统计 */
    async TurnoverTotalCash() {
        return await this.BaseTurnoverSql(Statistics.order_bills_pay_type_cash);
    }
    /** 净营业额-信用卡 */
    async TurnoverTotalCard() {
        return await this.BaseTurnoverSql(Statistics.order_bills_pay_card);
    }
    /** 净营业额-会员卡 */
    async TurnoverTotalMember() {
        return await this.BaseTurnoverSql(Statistics.order_bills_pay_member);
    }
    /** 净营业额-礼品卡 */
    async TurnoverTotalGift() {
        return await this.BaseTurnoverSql(Statistics.order_bills_pay_gift);
    }

    //---------------------------充值金额-------------------------
    /** 充值sql */
    async BaseRechargeSql(type, type_log = '') {
        var th = this;
        var sql = Models.tableName('orders')
            .when(type == Statistics.order_member_cards_pay_type_cz && type_log == 'member', function (query) {
                return query.select('SUM(order_member_cards.recharge_amount) as total')
                    .join('order_member_cards', { 'orders.id': 'order_member_cards.orders_id' })
                    .where('order_member_cards.pay_type', Statistics.order_member_cards_pay_type_cz)
                    .where('order_member_cards.state', Statistics.base_state_yes);
            })
            .when(type == Statistics.order_member_cards_pay_type_cz && type_log == 'gift', function (query) {
                return query.select('SUM(order_gift_card_logs.recharge_amount) as total')
                    .join('order_gift_card_logs', { 'orders.id': 'order_gift_card_logs.orders_id' })
                    .where('order_gift_card_logs.pay_type', Statistics.order_member_cards_pay_type_cz)
                    .where('order_gift_card_logs.state', Statistics.base_state_yes);
            })
            .when(type == Statistics.base_type_number && type_log == 'member', function (query) {
                return query.select('COUNT(orders.id) as total,order_member_cards.orders_id')
                    .join('order_member_cards', { 'orders.id': 'order_member_cards.orders_id' })
                    .where('order_member_cards.pay_type', Statistics.order_member_cards_pay_type_cz)
                    .where('order_member_cards.state', Statistics.base_state_yes)
            })
            .when(type == Statistics.base_type_number && type_log == 'gift', function (query) {
                return query.select('COUNT(orders.id) as total,order_gift_card_logs.orders_id')
                    .join('order_gift_card_logs', { 'orders.id': 'order_gift_card_logs.orders_id' })
                    .where('order_gift_card_logs.pay_type', Statistics.order_member_cards_pay_type_cz)
                    .where('order_gift_card_logs.state', Statistics.base_state_yes)
            })
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .when(type == Statistics.base_type_number && type_log == 'member', function (query) {
                return query.groupBy('order_member_cards.orders_id');
            })
            .when(type == Statistics.base_type_number && type_log == 'gift', function (query) {
                return query.groupBy('order_gift_card_logs.orders_id');
            })
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .get();
        
        var res = await this._query(sql);
        if (type == Statistics.base_type_number && res.length > 0) {
            return res.length;
        }

        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }


    /** 礼品卡充值金额 */
    async RechargeTotalGift() {
        return await this.BaseRechargeSql(Statistics.order_member_cards_pay_type_cz, 'gift');
    }
    /** 会员卡充值金额 */
    async RechargeTotalMember() {
        return await this.BaseRechargeSql(Statistics.order_member_cards_pay_type_cz, 'member');
    }
    /** 会员卡充值次数 */
    async RechargeTotalMemberNumber() {
        return await this.BaseRechargeSql(Statistics.base_type_number, 'member');
    }
    /** 礼品卡充值次数 */
    async RechargeTotalGiftNumber() {
        return await this.BaseRechargeSql(Statistics.base_type_number, 'gift');
    }
    /** 充值订单总数 */
    async RechargeTotalNumber() {
        let member_count = await this.RechargeTotalMemberNumber();
        let gift_count = await this.RechargeTotalGiftNumber();
        return member_count + gift_count;
    }

    //---------------------------------------订单数----------------------------------------

    async BaseOrderTotalSql(type) {
        var th = this;
        var sql = Models.tableName('orders')
            .when(type == Statistics.base_type_number, function (query) {
                return query.select('count(orders.id) as total');
            })
            .when(type == Statistics.base_state_no, function (query) {
                return query.select('sum(total_price) as total')
                    .where('orders.pay_state', 'notIn', [Statistics.order_pay_state_refunded, Statistics.order_pay_state_portion_refunded]);
            })
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }
    async BaseOrderSql(type = 0) {
        var th = this;
        var sql = Models.tableName('orders')
            .when(type == Statistics.base_state_no, function (query) {
                return query.select('COUNT(orders.id) total,subscribes.orders_id')
                    .join('subscribes', { 'orders.id': 'subscribes.orders_id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .groupBy('subscribes.orders_id');
            })
            .when(type == Statistics.base_state_yes, function (query) {
                return query.select('COUNT(orders.id) as total')
                    .where('orders.pay_state', Statistics.order_pay_state_cancel);
            })
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }

    /** 未预约订单总数 */
    async SubscribesTotalNot() {
        return await this.BaseOrderTotalSql(Statistics.base_type_number);
    }
    /** 已预约订单总数 */
    async SubscribesTotalSuccess() {
        return await this.BaseOrderSql(Statistics.base_state_no);
    }
    /** 取消订单总数 */
    async SubscribesTotalVoid() {
        return await this.BaseOrderSql(Statistics.base_state_yes);
    }
    /** 订单平均消费 */
    async OrderAverage() {
        let total = await this.SubscribesTotalNot();
        let order_price = await this.BaseOrderTotalSql(Statistics.base_state_no);
        let int_price = Number(order_price) / 100;
        return this.divideAndRound(int_price, total);
    }
    divideAndRound(num1, num2) {
        // 确保两个参数都是数字
        num1 = Number(num1);
        num2 = Number(num2);

        if (num2 === 0) {
            return 0;
        }

        // 执行除法运算，并将结果乘以100
        let result = (num1 / num2) * 100;

        // 使用Math.round()确保结果四舍五入
        return Math.round(result);
    }

    //-----------------------------退款金额---------------------------
    async BaseRefundOrderSql(pay_state, refund_fun) {
        var th = this;
        var sql = Models.tableName('orders')
            .select('SUM(order_refund_prices.price) as total')
            .join('order_refund_prices', { 'orders.id': 'order_refund_prices.orders_id' })
            .when(refund_fun > Statistics.base_type_number, function (query) {
                return query.where('order_refund_prices.refund_fun', refund_fun);
            })
            .when(pay_state > Statistics.base_type_number, function (query) {
                return query.where('orders.pay_state', pay_state);
            })
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length < 1 || res[0].total == undefined || res[0].total == null) {
            return 0;
        }
        return res[0].total;
    }

    //---------------------------------------退款金额---------------------------------------------
    /** 现金退款 */
    async CashRefundTotal() {
        return await this.BaseRefundOrderSql(Statistics.base_type_number, Statistics.refund_fun_cash);
    }

    /** 信用卡退款 */
    async CardRefundTotal() {
        return await this.BaseRefundOrderSql(Statistics.base_type_number, Statistics.refund_fun_card);
    }

    /** 会员卡退款 */
    async MemberRefundTotal() {
        return await this.BaseRefundOrderSql(Statistics.base_type_number, Statistics.refund_fun_member);
    }

    /** 礼品卡退款 */
    async GiftRefundTotal() {
        return await this.BaseRefundOrderSql(Statistics.base_type_number, Statistics.refund_fun_gift);
    }
    /** 整单退款 */
    async TotalRefundTotal() {
        return await this.BaseRefundOrderSql(Statistics.order_pay_state_refunded, Statistics.base_type_number);
    }
    /** 部分退款 */
    async PortionRefundTotal() {
        return await this.BaseRefundOrderSql(Statistics.order_pay_state_portion_refunded, Statistics.base_type_number);
    }

    //-----------------------------------退款原因-----------------------------------------------

    async BaseRefundCauseSql(refund_cause_type) {
        var th = this;

        var sql = Models.tableName('orders')
            .select('order_refund_prices.orders_id')
            .join('order_refund_prices', { 'orders.id': 'order_refund_prices.orders_id' })
            .where('order_refund_prices.refund_cause', refund_cause_type)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .where('orders.pay_state', 'in', [Statistics.order_pay_state_refunded, Statistics.order_pay_state_portion_refunded])
            .groupBy('order_refund_prices.orders_id')
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0) {
            return res.length;
        }
        return 0;
    }
    /** 退款原因-服务问题 */
    async ServeRefundCauseTotal() {
        return await this.BaseRefundCauseSql(Statistics.refund_cause_serve);
    }

    /** 退款原因-商品问题 */
    async GoodsRefundCauseTotal() {
        return await this.BaseRefundCauseSql(Statistics.refund_cause_goods);
    }

    /** 退款原因-健康问题 */
    async JkRefundCauseTotal() {
        return await this.BaseRefundCauseSql(Statistics.refund_cause_jk);
    }
    /** 退款原因-操作失误问题 */
    async ActionRefundCauseTotal() {
        return await this.BaseRefundCauseSql(Statistics.refund_cause_action);
    }
    /** 退款原因-其他问题 */
    async NotRefundCauseTotal() {
        return await this.BaseRefundCauseSql(Statistics.refund_cause_no);
    }


    //-----------------------------------礼品卡/会员卡消费-----------------------------------------------

    /** 礼品卡/会员卡消费sql */
    async BaseConsumeSql(type, pay_type) {
        var th = this;

        var sql = Models.tableName('orders')
            .when(type == Statistics.base_type_number && pay_type == Statistics.order_bills_pay_member, function (query) {
                return query.select('order_bills.orders_id')
                    .join('order_bills', { 'orders.id': 'order_bills.orders_id' })
                    .where('order_bills.pay_type', pay_type);

            })
            .when(type == Statistics.base_type_price && pay_type == Statistics.order_bills_pay_member, function (query) {
                return query.select('sum(order_bills.price) as total')
                    .join('order_bills', { 'orders.id': 'order_bills.orders_id' })
                    .where('order_bills.pay_type', pay_type);

            })

            .when(type == Statistics.base_type_number && pay_type == Statistics.order_bills_pay_gift, function (query) {
                return query.select('order_bills.orders_id')
                    .join('order_bills', { 'orders.id': 'order_bills.orders_id' })
                    .where('order_bills.pay_type', pay_type);

            })
            .when(type == Statistics.base_type_price && pay_type == Statistics.order_bills_pay_gift, function (query) {
                return query.select('sum(order_bills.price) as total')
                    .join('order_bills', { 'orders.id': 'order_bills.orders_id' })
                    .where('order_bills.pay_type', pay_type);

            })
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .when(type == Statistics.base_type_number, function (query) {
                return query.groupBy('order_bills.orders_id');
            })
            .get();
        
        var res = await this._query(sql);
        if (type == Statistics.base_type_number && res.length > 0) {
            return res.length;
        }
        if (type == Statistics.base_type_price && res.length > 0 && res[0].total != undefined && res[0].total > 0) {
            return res[0].total;
        }
        return 0;
    }
    /** 会员卡消费金额 */
    async MemberConsumeTotal() {
        return await this.BaseConsumeSql(Statistics.base_type_price, Statistics.order_bills_pay_member);
    }
    /** 会员卡消费-次数 */
    async MemberConsumeNumber() {
        return await this.BaseConsumeSql(Statistics.base_type_number, Statistics.order_bills_pay_member);
    }

    /** 礼品卡消费金额 */
    async GiftConsumeTotal() {
        return await this.BaseConsumeSql(Statistics.base_type_price, Statistics.order_bills_pay_gift);
    }
    /** 礼品卡消费-次数 */
    async GiftConsumeNumber() {
        return await this.BaseConsumeSql(Statistics.base_type_number, Statistics.order_bills_pay_gift);
    }

    //-----------------------------------总余额-----------------------------------------------

    /** 礼品卡表Sql */
    async BaseGiftSql(type, time = false) {
        var th = this;
        var sql = Models.tableName('gift_cards')
            .when(type == Statistics.base_type_number, function (query) {
                return query.select('count(gift_cards.id) as total');
            })
            .when(type == Statistics.base_type_price, function (query) {
                return query.select('count(gift_cards.balance) as total');
            })
            .when(time, function (query) {
                return query
                    .where('gift_cards.created_at', 'gte', th.getStartOfToday())
                    .where('gift_cards.created_at', 'lte', th.getEndOfToday())
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0 && res[0].total != undefined && res[0].total > 0) {
            return res[0].total;
        }
        return 0;
    }


    /** 会员卡表Sql */
    async BaseMemberSql(type, time = false) {
        var th = this;
        var sql = Models.tableName('members')
            .when(type == Statistics.base_type_number, function (query) {
                return query.select('count(members.id) as total');
            })
            .when(type == Statistics.base_type_price, function (query) {
                return query.select('sum(members.balance) as total');
            })
            .when(time, function (query) {
                return query
                    .where('members.created_at', 'gte', th.getStartOfToday())
                    .where('members.created_at', 'lte', th.getEndOfToday())
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0 && res[0].total != undefined && res[0].total > 0) {
            return res[0].total;
        }

        return 0;
    }
    /** 礼品卡沉淀余额 */
    async GiftBalanceTotal() {
        return await this.BaseGiftSql(Statistics.base_type_price);
    }
    /** 会员卡沉淀余额 */
    async MemberBalanceTotal() {
        return await this.BaseMemberSql(Statistics.base_type_price);
    }

    /** 礼品卡总个数 */
    async GiftNumberTotal() {
        return await this.BaseGiftSql(Statistics.base_type_number);
    }
    /** 会员卡总个数 */
    async MemberNumberTotal() {
        return await this.BaseMemberSql(Statistics.base_type_number);
    }
    /** 新礼品卡个数 */
    async GiftNewCardTotal() {
        return await this.BaseGiftSql(Statistics.base_type_number, true);
    }
    /** 新会员卡个数 */
    async MemberNewCardTotal() {
        return await this.BaseMemberSql(Statistics.base_type_number, true);
    }

    //----------------------------------预约统计-------------------------
    /** 预约统计 */
    async BaseSubscribesSql(type = undefined, time = false) {
        var th = this;
        var sql = Models.tableName('subscribes')
            .select('count(subscribes.id) as total')
            .when(type == Statistics.base_state_yes, function (query) {
                return query.where('subscribes.is_appoint', Statistics.base_state_yes)
            })
            .when(time, function (query) {
                return query
                    .where('subscribes.created_at', 'gte', th.getStartOfToday())
                    .where('subscribes.created_at', 'lte', th.getEndOfToday())
            })
            .when(time == false && this.begin_time != '' && this.end_time != '', function (query) {
                return query
                    .where('subscribes.created_at', 'gte', th.begin_time)
                    .where('subscribes.created_at', 'lte', th.end_time)
            })
            .get();
        
        var res = await this._query(sql);
        if (res[0].total != undefined && res[0].total > 0) {
            return res[0].total;
        }
        return 0;
    }
    /** 预约总数 */
    async SubscribesTotal() {
        return await this.BaseSubscribesSql();
    }

    /** 新客户预约数 */
    async SubscribesNewTotal() {
        return await this.BaseSubscribesSql(undefined, true);
    }
    /** 已完成预约数 */
    async SubscribesSuccessTotal() {
        return await this.BaseSubscribesSql(Statistics.base_state_yes, false);
    }

    /** 赴约率 */
    async SubscribesAppointTotal() {

        let completed = await this.SubscribesSuccessTotal();
        let total = await this.SubscribesTotal();
        return this.calculateCompletionRate(completed, total);
    }

    //-----------------------------------左侧员工商品销售统计-----------------------------------------------

    /** 左侧员工统计 */
    async BaseOrderStaffSql(is_serve) {
        var th = this;
        var sql = Models.tableName('orders')
            .select('sum(order_push_money.raw_price) as total,order_push_money.goods_id')
            .join('order_push_money', { 'orders.id': 'order_push_money.orders_id' })
            .join('order_goods', { 'orders.id': 'order_goods.orders_id' })
            .where('order_push_money.goods_id', 'raw', 'order_goods.goods_id')
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .where('order_goods.is_serve', is_serve)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .groupBy('order_push_money.goods_id')
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0) {
            var total_price = 0;
            res.map(function (item) {
                total_price += Number(item.total)
            })
            return total_price;
        }

        return 0;
    }
    /** 左侧员工服务商品销售统计 */
    LeftStaffServeTotal() {
        return this.BaseOrderStaffSql(Statistics.base_state_yes);
    }
    /** 左侧员工普通商品销售统计 */
    LeftStaffGoodsTotal() {
        return this.BaseOrderStaffSql(Statistics.base_state_no);
    }

    //-----------------------------------左侧员工提成统计-----------------------------------------------
    /** 左侧员工提成统计 */
    async BaseStaffPushMoneySql() {
        var th = this;
        var sql = Models.tableName('orders')
            .select('sum(order_goods.push_money) as total')
            .join('order_goods', { 'orders.id': 'order_goods.orders_id' })
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0 && res[0].total != undefined && res[0].total > 0) {
            return res[0].total;
        }
        return 0;
    }

    /** 提成统计 */
    async BaseStaffAveragePushMoneySql(type) {
        var th = this;
        var sql = Models.tableName('orders')
            .when(type == Statistics.base_type_price, function (query) {
                return query.select('order_goods.push_money as total')
                    .join('order_goods', { 'orders.id': 'order_goods.orders_id' })
                    .where('order_goods.push_money', 'gt', 0);
            })
            .when(type == Statistics.base_type_number, function (query) {
                return query.select('order_push_money.code')
                    .join('order_push_money', { 'orders.id': 'order_push_money.orders_id' });
            })
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .when(type == Statistics.base_type_number, function (query) {
                return query.groupBy('order_push_money.code');
            })
            .get();

        
        var res = await this._query(sql);
        if (type == Statistics.base_type_price && res.length > 0) {
            var arr = [];
            res.map(function (item) {
                arr.push(Number(item.total));
            })
            var average = this.calculateAverage(arr)
            return average;
        } else {
            if (res.length > 0) {
                return res.length;
            }
        }
        return 0;
    }
    /** 左侧员工总提成 */
    async LeftStaffPushTotal() {
        return await this.BaseStaffPushMoneySql();
    }
    /** 左侧员工平均提成 */
    async LeftStaffAveragePushTotal() {
        return await this.BaseStaffAveragePushMoneySql(Statistics.base_type_price);
    }
    /** 左侧员工总提成人数 */
    async LeftStaffPushNumberTotal() {
        return await this.BaseStaffAveragePushMoneySql(Statistics.base_type_number);
    }
    //----------------------------------------左侧员工服务统计--------------------------
    /** 左侧员工服务统计 */
    async BaseStaffServeNumberSql(type) {
        var th = this;
        var sql = Models.tableName('orders')
            .when(type == Statistics.base_type_number, function (query) {
                return query.select('count(order_push_money.id) as total')
                    .join('order_push_money', { 'orders.id': 'order_push_money.orders_id' })
                    .join('order_goods', { 'orders.id': 'order_goods.orders_id' })
                    .where('order_push_money.goods_id', 'raw', 'order_goods.goods_id')
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_goods.is_serve', Statistics.base_state_yes);
            })
            .when(type == Statistics.base_type_price, function (query) {
                return query.select('order_push_money.code')
                    .join('order_push_money', { 'orders.id': 'order_push_money.orders_id' })
                    .join('order_goods', { 'orders.id': 'order_goods.orders_id' })
                    .where('order_push_money.goods_id', 'raw', 'order_goods.goods_id')
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_goods.is_serve', Statistics.base_state_yes);
            })
            .when(this.begin_time != '' && this.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .when(type == Statistics.base_type_price, function (query) {
                return query.groupBy('order_push_money.code');
            })
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0 && res[0].total != undefined && res[0].total > 0) {
            return res[0].total;
        } else if (type == Statistics.base_type_price) {
            return res.length;
        }
        return 0;
    }

    async BaseTipSql(type) {
        var th = this;
        var sql = Models.tableName('orders')
            .select('order_tips.price as total')
            .join('order_tips', { 'orders.id': 'order_tips.orders_id' })
            .where('order_tips.state', Statistics.base_state_yes)
            .where('orders.pay_state', Statistics.order_pay_state_paid)
            .when(th.begin_time != '' && th.end_time != '', function (query) {
                return query.where('orders.created_at', 'gte', th.begin_time)
                    .where('orders.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        if (type == Statistics.base_type_price && res.length > 0) {
            var total = 0;
            res.map(function (item) {
                total += item.total;
            })
            return total;
        } else if (type == Statistics.base_type_number && res.length > 0) {
            var arr = [];
            res.map(function (item) {
                arr.push(Number(item.total));
            })
            var average = this.calculateAverage(arr)
            return average;
        }
        return 0;

    }

    /** 员工服务次数 */
    async LeftStaffServeNumberTotal() {
        return await this.BaseStaffServeNumberSql(Statistics.base_type_number);
    }
    /** 员工出勤人数 */
    async LeftStaffAttendanceNumberTotal() {
        return await this.BaseStaffServeNumberSql(Statistics.base_type_price);
    }

    /** 小费总计 */
    async LeftTipTotal() {
        return await this.BaseTipSql(Statistics.base_type_price);
    }
    /** 平均小费总计 */
    async LeftTipAverageTotal() {
        return await this.BaseTipSql(Statistics.base_type_number);
    }

    //--------------------------------员工签到记录---------------------------
    async BaseStaffSignInSql() {
        var th = this;
        var sql = Models.tableName('store_staff_sign_ins')
            .when(th.begin_time != '' && th.end_time != '', function (query) {
                return query.where('store_staff_sign_ins.created_at', 'gte', th.begin_time)
                    .where('store_staff_sign_ins.created_at', 'lte', th.end_time);
            })
            .get();
        
        var res = await this._query(sql);
        return res;
    }
    /** 员工签到记录 */
    async StaffSignInIndex() {
        return await this.BaseStaffSignInSql();
    }

    //--------------------------------员工总览---------------------------
    async BaseStaffOverviewSql() {
        var th = this;
        var sql = Models.tableName('store_staff')
            .select([
                'store_staff.id', 'store_staff.code', 'store_staff.time_wage', 'store_staff.name', 'store_staff.first_name', 'store_staff.last_name',
                Models.hasOne('OrderPushMoney', 'store_staff.code', 'order_push_money.code')
                    .tableName('order_push_money')
                    .OrderPushMoney({
                        total_price: 'SUM(order_push_money.total_price)'
                    }, false)
                    .join('orders', { 'order_push_money.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_push_money.state', Statistics.base_state_yes)
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        return query.where('orders.created_at', 'gte', th.begin_time)
                            .where('orders.created_at', 'lte', th.end_time);
                    })
                    .getSubquerySql(),
                Models.hasOne('OrderTips', 'store_staff.id', 'order_tips.staff_id')
                    .tableName('order_tips')
                    .OrderTips({
                        price: 'SUM(order_tips.price)',
                    }, false)
                    .join('orders', { 'order_tips.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_tips.state', Statistics.base_state_yes)
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        return query.where('orders.created_at', 'gte', th.begin_time)
                            .where('orders.created_at', 'lte', th.end_time);
                    })
                    .getSubquerySql(),
                Models.hasMany('StoreStaffSignIns', 'store_staff.code', 'store_staff_sign_ins.code')
                    .tableName('store_staff_sign_ins')
                    .StoreStaffSignIns({
                        date_time: 'store_staff_sign_ins.date_time',
                        begin_time: 'store_staff_sign_ins.begin_time',
                        end_time: 'store_staff_sign_ins.end_time',
                        working_hours: 'store_staff_sign_ins.working_hours',
                        time_wage: 'store_staff_sign_ins.time_wage',
                    }, false)
                    .where('store_staff_sign_ins.end_time', 'neq', '')
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        return query.where('store_staff_sign_ins.created_at', 'gte', th.begin_time)
                            .where('store_staff_sign_ins.created_at', 'lte', th.end_time);
                    })
                    .getSubquerySql(),

            ])
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0) {
            res = res.map(function (item) {
                item.OrderPushMoney = JSON.parse(item.OrderPushMoney)
                item.OrderTips = JSON.parse(item.OrderTips)
                item.StoreStaffSignIns = JSON.parse(item.StoreStaffSignIns)
                item.OrderPushMoney = item.OrderPushMoney == null || item.OrderPushMoney.total_price == undefined || item.OrderPushMoney.total_price == '' ? 0 : item.OrderPushMoney.total_price;
                item.OrderTips = item.OrderTips == null || item.OrderTips.price == undefined || item.OrderTips.price == '' ? 0 : item.OrderTips.price;
                item.TotalPrice = Number(item.OrderPushMoney) + Number(item.OrderTips)
                item.TimeTotal = 0;
                if (item.StoreStaffSignIns != null && item.StoreStaffSignIns.length > 0) {
                    item.StoreStaffSignIns.map(function (item2) {
                        item.TimeTotal += Number(item2.working_hours)
                    })
                } else {
                    item.StoreStaffSignIns = []
                }
                return item;
            })
        }
        return res;
    }
    /** 员工总览 */
    async StaffOverviewIndex() {
        return await this.BaseStaffOverviewSql();
    }
    //--------------------------------打印员工总览明细---------------------------
    async BaseStaffInputOverviewSql(code) {
        var th = this;
        var sql = Models.tableName('store_staff_sign_ins')
            .select([
                'store_staff_sign_ins.*',
                Models.hasOne('OrderPushMoney', 'store_staff_sign_ins.code', 'order_push_money.code')
                    .tableName('order_push_money')
                    .OrderPushMoney({
                        total_price: 'SUM(order_push_money.total_price)',
                    }, false)
                    .join('orders', { 'order_push_money.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_push_money.state', Statistics.base_state_yes)
                    .where('orders.created_at', 'raw_between', ['store_staff_sign_ins.date_time || " " ||  store_staff_sign_ins.begin_time', 'store_staff_sign_ins.date_time || " " ||  store_staff_sign_ins.end_time'])
                    .getSubquerySql(),
                Models.hasOne('OrderTips', 'store_staff_sign_ins.code', 'order_tips.code')
                    .tableName('order_tips')
                    .OrderTips({
                        price: 'SUM(order_tips.price)',
                    }, false)
                    .join('orders', { 'order_tips.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_tips.state', Statistics.base_state_yes)
                    .where('orders.created_at', 'raw_between', ['store_staff_sign_ins.date_time || " " ||  store_staff_sign_ins.begin_time', 'store_staff_sign_ins.date_time || " " ||  store_staff_sign_ins.end_time'])
                    .getSubquerySql(),

            ])
            .where('store_staff_sign_ins.code', code)
            .where('store_staff_sign_ins.end_time', 'neq', '')
            .when(th.begin_time != '' && th.end_time != '', function (query) {
                return query.where('store_staff_sign_ins.created_at', 'gte', th.begin_time)
                    .where('store_staff_sign_ins.created_at', 'lte', th.end_time);
            })
            .get()
        
        var res = await this._query(sql);
        if (res.length > 0) {
            res = res.map(function (item) {
                item.OrderPushMoney = JSON.parse(item.OrderPushMoney)
                item.OrderTips = JSON.parse(item.OrderTips)
                item.OrderPushMoney = item.OrderPushMoney == null || item.OrderPushMoney.total_price == undefined || item.OrderPushMoney.total_price == '' ? 0 : item.OrderPushMoney.total_price;
                item.OrderTips = item.OrderTips == null || item.OrderTips.price == undefined || item.OrderTips.price == '' ? 0 : item.OrderTips.price;
                item.TotalPrice = Number(item.OrderPushMoney) + Number(item.OrderTips)
                return item;
            })
        }
        return res;
    }
    /**
     * 打印员工总览明细
     * @param {*} code  员工编号
     * @returns 
     */
    async StaffInputOverview(code) {
        return await this.BaseStaffInputOverviewSql(code);
    }

    /** 预约总览Sql */
    async BaseSubscribesOverviewSql() {
        var th = this;
        var sql = Models.tableName('store_staff')
            .select([
                'store_staff.*',
                Models.hasOne('OrderPushMoney', 'store_staff.code', 'order_push_money.code')
                    .tableName('order_push_money')
                    .OrderPushMoney({
                        total_price: 'SUM(order_push_money.total_price)',
                    }, false)
                    .join('orders', { 'order_push_money.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_push_money.state', Statistics.base_state_yes)
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        return query.where('orders.created_at', 'gte', th.begin_time)
                            .where('orders.created_at', 'lte', th.end_time);
                    })
                    .getSubquerySql(),
                Models.hasOne('OrderTips', 'store_staff.code', 'order_tips.code')
                    .tableName('order_tips')
                    .OrderTips({
                        price: 'SUM(order_tips.price)',
                    }, false)
                    .join('orders', { 'order_tips.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_tips.state', Statistics.base_state_yes)
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        return query.where('orders.created_at', 'gte', th.begin_time)
                            .where('orders.created_at', 'lte', th.end_time);
                    })
                    .getSubquerySql(),
                Models.hasMany('Subscribes', 'store_staff.id', 'subscribes.staff_id')
                    .tableName('subscribes')
                    .Subscribes({
                        id: 'subscribes.id',
                        date_time: 'subscribes.date_time',
                        begin_time: 'subscribes.begin_time',
                        end_time: 'subscribes.end_time',
                        is_appoint: 'subscribes.is_appoint'
                    }, false)
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        let [begin_date, begin_time] = th.begin_time.split(' ');
                        let [end_date, end_time] = th.end_time.split(' ');
                        return query.where('subscribes.date_time', 'gte', begin_date)
                            .where('subscribes.date_time', 'lte', end_date);
                    })
                    .getSubquerySql()
            ])
            .get()
        
        var res = await this._query(sql);
        var base_state_yes = Statistics.base_state_yes;
        if (res.length > 0) {
            res = res.map(function (item) {
                item.Subscribes = JSON.parse(item.Subscribes)
                item.OrderPushMoney = JSON.parse(item.OrderPushMoney)
                item.OrderTips = JSON.parse(item.OrderTips)
                item.OrderPushMoney = item.OrderPushMoney == null || item.OrderPushMoney.total_price == undefined || item.OrderPushMoney.total_price == '' ? 0 : item.OrderPushMoney.total_price;
                item.OrderTips = item.OrderTips == null || item.OrderTips.price == undefined || item.OrderTips.price == '' ? 0 : item.OrderTips.price;
                item.TotalPrice = Number(item.OrderPushMoney) + Number(item.OrderTips)
                item.ServerNumberTotal = 0//服务次数
                item.ServerSuccessTotal = 0;//完成预约总数
                if (item.Subscribes != null && item.Subscribes.length > 0) {
                    item.ServerNumberTotal = item.Subscribes.length
                    item.Subscribes = item.Subscribes.map(function (items) {
                        if (items.is_appoint == base_state_yes) {
                            item.ServerSuccessTotal++;
                        }
                        return items;
                    })

                } else {
                    item.Subscribes = [];
                }
                return item;
            })
        }
        return res;
    }
    /**
     * 
     * @param {*} code 员工编号
     */
    async BaseSubscribesOverviewInputSql(staff_id) {
        var th = this;
        var sql = Models.tableName('subscribes')
            .select([
                'subscribes.*',
                Models.hasOne('OrderPushMoney', 'subscribes.staff_id', 'order_push_money.staff_id')
                    .tableName('order_push_money')
                    .OrderPushMoney({
                        total_price: 'SUM(order_push_money.total_price)',
                    }, false)
                    .join('orders', { 'order_push_money.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_push_money.state', Statistics.base_state_yes)
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        return query.where('orders.created_at', 'gte', th.begin_time)
                            .where('orders.created_at', 'lte', th.end_time);
                    })
                    .getSubquerySql(),
                Models.hasOne('OrderTips', 'subscribes.staff_id', 'order_tips.staff_id')
                    .tableName('order_tips')
                    .OrderTips({
                        price: 'SUM(order_tips.price)',
                    }, false)
                    .join('orders', { 'order_tips.orders_id': 'orders.id' })
                    .where('orders.pay_state', Statistics.order_pay_state_paid)
                    .where('order_tips.state', Statistics.base_state_yes)
                    .when(th.begin_time != '' && th.end_time != '', function (query) {
                        return query.where('orders.created_at', 'gte', th.begin_time)
                            .where('orders.created_at', 'lte', th.end_time);
                    })
                    .getSubquerySql(),

            ])
            .where('subscribes.staff_id', staff_id)
            .where('subscribes.end_time', 'neq', '')
            .when(th.begin_time != '' && th.end_time != '', function (query) {
                return query.where('subscribes.created_at', 'gte', th.begin_time)
                    .where('subscribes.created_at', 'lte', th.end_time);
            })
            .get()
        
        var res = await this._query(sql);
        if (res.length > 0) {
            res = res.map(function (item) {
                item.OrderPushMoney = JSON.parse(item.OrderPushMoney)
                item.OrderTips = JSON.parse(item.OrderTips)
                item.OrderPushMoney = item.OrderPushMoney == null || item.OrderPushMoney.total_price == undefined || item.OrderPushMoney.total_price == '' ? 0 : item.OrderPushMoney.total_price;
                item.OrderTips = item.OrderTips == null || item.OrderTips.price == undefined || item.OrderTips.price == '' ? 0 : item.OrderTips.price;
                item.TotalPrice = Number(item.OrderPushMoney) + Number(item.OrderTips)
                return item;
            })
        }
        return res;
    }
    /** 预约总览 */
    async SubscribesOverview() {
        return await this.BaseSubscribesOverviewSql();
    }
    /** 打印预约总览明细 */
    async SubscribesOverviewInput(staff_id) {
        return await this.BaseSubscribesOverviewInputSql(staff_id);
    }

    /** 商品销售 */
    async BaseGoodsOverviewSql() {
        var th = this;
        var sql = Models.tableName('store_staff')
            .select(['id', 'code', 'name', 'first_name', 'last_name'])
            .get();
        
        var res = await this._query(sql);
        if (res.length > 0) {

        }
        return res;
    }

    async GoodsOverview() {
        return await this.BaseGoodsOverviewSql();
    }
    _query(sql) {
        console.time("queryExecution"); // 开始计时
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
            db.close();
            console.timeEnd("queryExecution"); // 结束计时并打印结果
        });
    }
}

var StatisticsModel = new Statistics();
// StatisticsModel.test().then((res) => {
//     console.log(res, 'res-------------------')
// });

// StatisticsModel.setDateTime('2023-09-05', '2023-09-05');
// console.log("Start of today:", StatisticsModel.getStartOfToday());
// console.log("End of today:", StatisticsModel.getEndOfToday());

// var tip_total = await StatisticsModel.TipTotal();
// var tax_total = await StatisticsModel.TaxTotal();
// var discounts_total = await StatisticsModel.DiscountsTotal();

// console.log(
//     "总营收-小费总额：" + tip_total,
//     "总营收-税费总额：" + tax_total,
//     "总营收-优惠总额：" + discounts_total,
// );

//净营业额
// var turnover_cash = await StatisticsModel.TurnoverTotalCash();
// var turnover_card = await StatisticsModel.TurnoverTotalCard();
// var turnover_member = await StatisticsModel.TurnoverTotalMember();
// var turnover_gift = await StatisticsModel.TurnoverTotalGift();
// console.log(
//     "净营业额-现金：" + turnover_cash,
//     "净营业额-信用卡：" + turnover_card,
//     "净营业额-会员卡：" + turnover_member,
//     "净营业额-礼品卡：" + turnover_gift,
// );

// //充值金额
// var recharge_gift = await StatisticsModel.RechargeTotalGift();
// var recharge_member = await StatisticsModel.RechargeTotalMember();
// var recharge_number = await StatisticsModel.RechargeTotalNumber();
// console.log(
//     "充值金额-订单数：" + recharge_number,
//     "充值金额-会员卡：" + recharge_member,
//     "充值金额-礼品卡：" + recharge_gift,
// );

// //订单数
// var subscribes_not = await StatisticsModel.SubscribesTotalNot();
// var subscribes_success = await StatisticsModel.SubscribesTotalSuccess();
// var subscribes_void = await StatisticsModel.SubscribesTotalVoid();
// var subscribes_average = await StatisticsModel.OrderAverage()
// console.log(
//     "订单数-未预约：" + subscribes_not,
//     "订单数-已预约：" + subscribes_success,
//     "订单数-取消订单：" + subscribes_void,
//     "订单数-平均消费" + subscribes_average
// );

// //退款金额
// var cash_refund = await StatisticsModel.CashRefundTotal();
// var card_refund = await StatisticsModel.CardRefundTotal();
// var member_refund = await StatisticsModel.MemberRefundTotal();
// var gift_refund = await StatisticsModel.GiftRefundTotal();
// var total_refund = await StatisticsModel.TotalRefundTotal();
// var portion_refund = await StatisticsModel.PortionRefundTotal();
// console.log(
//     "退款金额-现金退款：" + cash_refund,
//     "退款金额-信用卡退款：" + card_refund,
//     "退款金额-会员卡退款：" + member_refund,
//     "退款金额-礼品卡退款" + gift_refund,
//     "退款金额-整单退款" + total_refund,
//     "退款金额-部分退款" + portion_refund,
// );


// //退款原因
// var serve_cause_refund = await StatisticsModel.ServeRefundCauseTotal();
// var goods_cause_refund = await StatisticsModel.GoodsRefundCauseTotal();
// var jk_cause_refund = await StatisticsModel.JkRefundCauseTotal();
// var action_cause_refund = await StatisticsModel.ActionRefundCauseTotal();
// var not_cause_refund = await StatisticsModel.NotRefundCauseTotal();

// console.log(
//     "退款原因-服务：" + serve_cause_refund,
//     "退款原因-商品：" + goods_cause_refund,
//     "退款原因-健康：" + jk_cause_refund,
//     "退款原因-操作失误：" + action_cause_refund,
//     "退款原因-其他：" + not_cause_refund,
// );

// //总充值
// var recharge_member_number = await StatisticsModel.RechargeTotalMemberNumber();
// var gift_member_number = await StatisticsModel.RechargeTotalGiftNumber();
// var recharge_member = await StatisticsModel.RechargeTotalMember();
// var recharge_gift = await StatisticsModel.RechargeTotalGift();


// console.log(
//     "总充值-会员卡金额：" + recharge_member,
//     "总充值-礼品卡金额：" + recharge_gift,
//     "总充值-会员卡次数：" + recharge_member_number,
//     "总充值-礼品卡次数：" + gift_member_number,
// );

// //礼品、会员卡消费
// var member_consume_price = await StatisticsModel.MemberConsumeTotal();
// var member_consume_number = await StatisticsModel.MemberConsumeNumber();
// var gift_consume_price = await StatisticsModel.GiftConsumeTotal();
// var gift_consume_number = await StatisticsModel.GiftConsumeNumber();


// console.log(
//     "礼品/会员卡消费-会员卡金额：" + member_consume_price,
//     "礼品/会员卡消费-礼品卡金额：" + gift_consume_price,
//     "礼品/会员卡消费-会员卡次数：" + member_consume_number,
//     "礼品/会员卡消费-礼品卡次数：" + gift_consume_number,
// );

// //总余额
// var gift_balance_total = await StatisticsModel.GiftBalanceTotal();
// var member_balance_total = await StatisticsModel.MemberBalanceTotal();
// var gift_number_total = await StatisticsModel.GiftNumberTotal();
// var member_number_total = await StatisticsModel.MemberNumberTotal();

// console.log(
//     "总余额-会员卡金额：" + member_balance_total,
//     "总余额-礼品卡金额：" + gift_balance_total,
//     "总余额-礼品卡个数：" + gift_number_total,
//     "总余额-会员卡个数：" + member_number_total,
// );

// //新开的会员卡和礼品卡
// var gift_new_card_total = await StatisticsModel.GiftNewCardTotal();
// var member_new_card_total = await StatisticsModel.MemberNewCardTotal();

// console.log(
//     "礼品/会员卡数量-新礼品卡个数：" + gift_new_card_total,
//     "礼品/会员卡数量-新会员卡个数：" + member_new_card_total,
// );


// //预约统计
// var subscribes_total = await StatisticsModel.SubscribesTotal();
// var Subscribes_new_total = await StatisticsModel.SubscribesNewTotal();
// var Subscribes_success_total = await StatisticsModel.SubscribesSuccessTotal();
// var Subscribes_rate_total = await StatisticsModel.SubscribesAppointTotal();

// console.log(
//     "预约统计-总预约个数：" + subscribes_total,
//     "预约统计-新客户预约个数：" + Subscribes_new_total,
//     "预约统计-完成预约个数：" + Subscribes_success_total,
//     "预约统计-赴约率" + Subscribes_rate_total,
// );

// //左侧员工统计
// var left_staff_serve = await StatisticsModel.LeftStaffServeTotal();
// var left_staff_goods = await StatisticsModel.LeftStaffGoodsTotal();

// console.log(
//     "左侧员工统计-服务商品销售额" + left_staff_serve,
//     "左侧员工统计-普通商品销售额" + left_staff_goods,
// );


// //左侧员工提成统计
// var left_staff_push = await StatisticsModel.LeftStaffPushTotal();
// var left_staff_average = await StatisticsModel.LeftStaffAveragePushTotal();
// var left_staff_push_number = await StatisticsModel.LeftStaffPushNumberTotal();
// console.log(
//     "左侧员工统计-总提成统计" + left_staff_push,
//     "左侧员工统计-平均提成统计" + left_staff_average,
//     "左侧员工统计-提成总人数" + left_staff_push_number,
// );
// //左侧员工服务次数统计
// var left_staff_serve_number = await StatisticsModel.LeftStaffServeNumberTotal();
// var left_staff_attendance_number = await StatisticsModel.LeftStaffAttendanceNumberTotal();

// console.log(
//     "左侧员工统计-服务次数统计" + left_staff_serve_number,
//     "左侧员工统计-出勤次数统计" + left_staff_attendance_number,
// );

// //左侧员工服务次数统计
// var left_staff_tip_total = await StatisticsModel.LeftTipTotal();
// var left_staff_tip_average_total = await StatisticsModel.LeftTipAverageTotal();

// console.log(
//     "左侧员工统计-小费总计" + left_staff_tip_total,
//     "左侧员工统计-平均小费总计" + left_staff_tip_average_total,
// );


// //左侧员工服务次数统计
// var staff_signin_index = await StatisticsModel.StaffSignInIndex();

// console.log('员工签到记录', staff_signin_index)

// //员工总览
// var staff_overview_index = await StatisticsModel.StaffOverviewIndex();
// console.log('员工总览', staff_overview_index)



// //打印员工总览明细
// var staff_input_overview = await StatisticsModel.StaffInputOverview(10000000);
// console.log('打印员工总览明细', staff_input_overview)

// //预约总览
// var subscribes_overview = await StatisticsModel.SubscribesOverview();
// console.log('预约总览', subscribes_overview)
// var subscribes_overview_input = await StatisticsModel.SubscribesOverviewInput(1);
// console.log('打印预约总览明细', subscribes_overview_input)

// var goods_overview = await StatisticsModel.GoodsOverview();
// console.log('商品销售', goods_overview)


export default StatisticsModel;