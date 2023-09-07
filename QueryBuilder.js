class QueryBuilder {
    constructor() {
      this.tableNameVal = "";
      this.selectColumns = ["*"];
      this.condition = [];
      this.orderByColumns = [];
      this.database_type = "sqlite3";
      this.limitVal = null;
      this.offsetVal = null;
      this.insertData = null;
      this.updateData = null;
      this.deleteFlag = false;
      this.whereRawColumnData = [];
      this.columnMapping = {};
      this.groupByData = "";
      this.joinClauses = [];
    }
  
    /**
     * 设置表名称
     * @param {*} tableName
     * @returns
     */
    tableName(tableName) {
      this.tableNameVal = tableName;
      return this;
    }
    /**
     * 查询语句
     * @param {*} columns
     * @returns
     */
    select(columns) {
      if (typeof columns === "string") {
        this.selectColumns = columns.split(",").map((column) => column.trim());
      } else if (Array.isArray(columns)) {
        this.selectColumns = columns.map((column) => column.trim());
      } else {
        throw new Error(
          "Invalid columns format. Please pass a string or an array of column names."
        );
      }
      return this;
    }
  
    /**
     * 联合查询
     * @param {*} table
     * @param {*} conditions
     * @returns
     */
    join(table, conditions, val) {
      var joinClauses = this.BaseJoinSql(table, conditions, val, `JOIN`);
      if (joinClauses.length > 0) {
        this.joinClauses = [...this.joinClauses, ...joinClauses];
      }
      return this;
    }
  
    /**
     *
     * @param {*} table
     * @param {*} conditions
     * @returns
     */
    leftJoin(table, conditions, val) {
      var joinClauses = this.BaseJoinSql(table, conditions, val, `LEFT JOIN`);
      if (joinClauses.length > 0) {
        this.joinClauses = [...this.joinClauses, ...joinClauses];
      }
      return this;
    }
  
    rightJoin(table, conditions, val) {
      var joinClauses = this.BaseJoinSql(table, conditions, val, `RIGHT JOIN`);
      if (joinClauses.length > 0) {
        this.joinClauses = [...this.joinClauses, ...joinClauses];
      }
      return this;
    }
    BaseJoinSql(table, conditions, val, type) {
      var joinClauses = [];
      if (val != undefined) {
        joinClauses.push(`${type} ${table} ON ${conditions} = ${val}`);
      } else {
        joinClauses.push(
          `${type} ${table} ON ${Object.keys(conditions)[0]} = ${
            conditions[Object.keys(conditions)[0]]
          }`
        );
      }
      return joinClauses;
    }
    /**
     * 条件语句生成
     * @param {*} column
     * @param {*} valueOrOperator
     * @param {*} value
     * @returns
     */
    where(column, valueOrOperator, value) {
      if (value || value == "" || value==0) {
        var conditions = this.BaseWhereSql(column, valueOrOperator, value);
        this.condition = [...conditions, ...this.condition];
      } else {
        if (typeof value === "string") {
          this.condition.push(`${column} = '${valueOrOperator}'`);
        } else {
          this.condition.push(`${column} = ${valueOrOperator}`);
        }
      }
      return this;
    }
    /**
     * 如果方法
     * @param {*} condition
     * @param {*} callback
     * @returns
     */
    when(condition, callback) {
      if (condition) {
        callback(this);
      }
      return this;
    }
    //字段条件的引用
    whereRawColumn(column, valueOrOperator, value) {
      if (typeof value === "undefined") {
        if (typeof value === "string") {
          this.whereRawColumnData.push(`${column} = '${valueOrOperator}'`);
        } else {
          this.whereRawColumnData.push(`${column} = ${valueOrOperator}`);
        }
      } else {
        this.BaseWhereSql(column, valueOrOperator, value);
      }
      return this;
    }
    /**
     * 排序语句生成
     * @param {*} column
     * @param {*} direction
     * @returns
     */
    orderBy(column, direction = "asc") {
      const orderByItem = `${column} ${
        direction.toLowerCase() === "desc" ? "DESC" : "ASC"
      }`;
      this.orderByColumns.push(orderByItem);
      return this;
    }
    groupBy(column) {
      this.groupByData = ` GROUP BY ${column} `;
      return this;
    }
    limit(limit) {
      this.limitVal = limit;
      return this;
    }
  
    offset(offset) {
      this.offsetVal = offset;
      return this;
    }
  
    insert(data) {
      this.insertData = data;
      return this.generateInsertSQL(this.tableNameVal, this.insertData);
    }
  
    update(data) {
      this.updateData = data;
      return this.generateUpdateSQL(
        this.tableNameVal,
        this.updateData,
        this.condition
      );
    }
  
    delete() {
      this.deleteFlag = true;
      return this.generateDeleteSQL(this.tableNameVal, this.condition);
    }
    /**
     * 获取sql实例
     * @returns
     */
    get() {
      let sql = this.generateSelectSQL(
        this.tableNameVal,
        this.selectColumns,
        this.joinClauses,
        this.condition,
        this.orderByColumns,
        this.groupByData,
        this.limitVal,
        this.offsetVal
      );
      this.clear();
      return sql;
    }
    clear() {
      this.tableNameVal = "";
      this.selectColumns = ["*"];
      this.condition = [];
      this.orderByColumns = [];
      this.database_type = "sqlite3";
      this.limitVal = null;
      this.offsetVal = null;
      this.insertData = null;
      this.updateData = null;
      this.deleteFlag = false;
      this.whereRawColumnData = [];
      this.columnMapping = {};
      this.groupByData = "";
      this.joinClauses = [];
      return this;
    }
    /**
     * 获取子查询sql
     * @returns
     */
    getSubquerySql() {
      let sql = this.subquerySelectSql(
        this.tableNameVal,
        this.subqueryArr,
        this.columnMapping,
        // this.whereRawColumnData,
        this.joinClauses,
        this.condition,
        this.orderByColumns,
        this.limitVal,
        this.offsetVal
      );
      this.clear();
      return sql;
    }
    /**
     * 拼接sql查询实例
     * @param {*} tableName
     * @param {*} columns
     * @param {*} condition
     * @param {*} orderByColumns
     * @param {*} limit
     * @param {*} offset
     * @returns
     */
    generateSelectSQL(
      tableName,
      columns,
      joinClauses,
      condition,
      orderByColumns,
      groupByData,
      limit,
      offset
    ) {
      let columnsString = columns.join(", ");
      let whereCondition = "";
      let joinClauses_str = "";
      if (condition.length == 1) {
        whereCondition = " WHERE " + condition.join(" ");
      } else if (condition.length > 1) {
        whereCondition = " WHERE " + condition.join(" AND ");
      }
      if (joinClauses.length > 0) {
        joinClauses_str = joinClauses.join(" ");
      }
  
      let orderByClause = "";
      if (orderByColumns.length > 0) {
        orderByClause = " ORDER BY " + orderByColumns.join(", ");
      }
      let limitOffsetClause = "";
      if (typeof limit === "number" && typeof offset === "number") {
        limitOffsetClause = ` LIMIT ${limit} OFFSET ${offset}`;
      }
      return ` SELECT ${columnsString} FROM ${tableName} ${joinClauses_str} ${whereCondition} ${groupByData} ${orderByClause} ${limitOffsetClause};`;
    }
  
    /**
     * 拼接子sql查询实例
     * @param {*} tableName
     * @param {*} subqueryArr
     * @param {*} columnMapping
     * @param {*} whereRawCondition
     * @param {*} condition
     * @param {*} orderByColumns
     * @param {*} limit
     * @param {*} offset
     * @returns
     */
    subquerySelectSql(
      tableName,
      subqueryArr,
      columnMapping,
      joinClauses,
      condition,
      orderByColumns,
      limit,
      offset
    ) {
      let whereCondition = "";
      let joinClauses_str = "";
      let selectSQL = "";
      let sqldata = {
        key: 0,
        value: {},
        joinClauses: [],
        conditions: [],
        whereRawArr: [],
      };
      // if (typeof whereRawCondition == 'object' && whereRawCondition !== null) {
      //     whereCondition = ` WHERE ${subqueryArr.primaryKey} = ${subqueryArr.foreignKey}`;
      // }
      if (condition.length == 1) {
        whereCondition = " WHERE " + condition.join(" ");
      } else if (condition.length > 1) {
        whereCondition = " WHERE " + condition.join(" AND ");
      }
      if (joinClauses.length > 0) {
        joinClauses_str = joinClauses.join(" ");
      }
  
      let orderByClause = "";
      if (orderByColumns.length > 0) {
        orderByClause = " ORDER BY " + orderByColumns.join(", ");
      }
      let limitOffsetClause = "";
      if (typeof limit === "number" && typeof offset === "number") {
        limitOffsetClause = ` LIMIT ${limit} OFFSET ${offset}`;
      }
      var keyValuePairs;
      var i = 0;
      var i2 = 0;
      if (
        subqueryArr.selectSQL == "JSON_OBJECT" &&
        typeof columnMapping === "object" &&
        this.database_type == "sqlite3"
      ) {
        keyValuePairs = Object.entries(columnMapping).map(([key, value]) => {
          if (i == 0) {
            i++;
            return `'"${key}":"' || IFNULL(${value},'')  `;
          } else {
            i++;
            return `'","${key}":"' || IFNULL(${value},'') `;
          }
        });
        selectSQL = `'{' || ${keyValuePairs.join(" || ")} || '"}'`;
      } else if (
        subqueryArr.selectSQL == "JSON_ARRAYAGG" &&
        typeof columnMapping === "object" &&
        this.database_type == "sqlite3"
      ) {
        keyValuePairs = Object.entries(columnMapping).map(([key, value]) => {
          if (i2 == 0) {
            i2++;
            return `'"${key}":"' || IFNULL(${value},'')  `;
          } else {
            i2++;
            return `'","${key}":"' || IFNULL(${value},'') `;
          }
        });
  
        selectSQL = `'[' || GROUP_CONCAT( '{' || ${keyValuePairs.join(
          " || "
        )} || '"}') || ']'`;
      } else if (
        subqueryArr.selectSQL == "JSON_OBJECT" &&
        typeof columnMapping === "object" &&
        this.database_type == "mysql"
      ) {
        selectSQL = `JSON_OBJECT(${Object.entries(columnMapping)
          .map(([key, value]) => `'${key}',${value}`)
          .join(", ")})`;
      } else if (
        subqueryArr.selectSQL == "JSON_ARRAYAGG" &&
        typeof columnMapping === "object" &&
        this.database_type == "mysql"
      ) {
        selectSQL = `JSON_ARRAYAGG(JSON_OBJECT(${Object.entries(columnMapping)
          .map(([key, value]) => `'${key}',${value}`)
          .join(", ")}))`;
      }
      return ` (SELECT ${selectSQL} FROM ${tableName} ${joinClauses_str} ${whereCondition} ${orderByClause} ${limitOffsetClause} ) as  ${subqueryArr.alias}`;
    }
    BaseWhereSql(key, valueOrOperator, conditionValue) {
      var condition = [];
      var operator = "";
      switch (valueOrOperator) {
        case "eq":
          operator = "=";
          break;
        case "neq":
          operator = "<>";
          break;
        case "gt":
          operator = ">";
          break;
        case "gte":
          operator = ">=";
          break;
        case "lt":
          operator = "<";
          break;
        case "lte":
          operator = "<=";
          break;
        case "raw":
          condition.push(`${key} = ${conditionValue}`);
          break;
        case "raw_between":
          condition.push(`${key} >= ${conditionValue[0]}`);
          condition.push(`${key} <= ${conditionValue[1]}`);
          break;
        case "in":
          if (!Array.isArray(conditionValue)) {
            throw new Error("IN condition value must be an array.");
          }
          condition.push(
            `${key} IN (${conditionValue
              .map((val) => {
                if (typeof val === "string") {
                  return `'${val}'`;
                }
                return val;
              })
              .join(", ")})`
          );
          break;
        case "notIn":
          if (!Array.isArray(conditionValue)) {
            throw new Error("NOT IN condition value must be an array.");
          }
          condition.push(
            `${key} NOT IN (${conditionValue
              .map((val) => {
                if (typeof val === "string") {
                  return `'${val}'`;
                }
                return val;
              })
              .join(", ")})`
          );
          break;
        case "like":
          if (typeof conditionValue !== "string") {
            throw new Error("LIKE condition value must be a string.");
          }
          condition.push(`${key} LIKE '%${conditionValue}%'`);
          break;
        default:
          operator = "";
      }
  
      if (operator != "") {
        if (typeof conditionValue === "string") {
          condition.push(`${key} ${operator} '${conditionValue}'`);
        } else {
          condition.push(`${key} ${operator} ${conditionValue}`);
        }
      }
      return condition;
    }
    baseIfSql(key, value, joinClauses, conditions) {
      const conditionOperator = Object.keys(value)[0];
      const conditionValue = value[conditionOperator];
      let operator = "";
      switch (conditionOperator) {
        case "eq":
          operator = "=";
          break;
        case "neq":
          operator = "<>";
          break;
        case "gt":
          operator = ">";
          break;
        case "gte":
          operator = ">=";
          break;
        case "lt":
          operator = "<";
          break;
        case "lte":
          operator = "<=";
          break;
        case "raw":
          conditions.push(`${key} = ${conditionValue}`);
          break;
        case "raw_between":
          conditions.push(`${key} >= ${conditionValue[0]}`);
          conditions.push(`${key} <= ${conditionValue[1]}`);
          break;
        case "in":
          if (!Array.isArray(conditionValue)) {
            throw new Error("IN condition value must be an array.");
          }
          conditions.push(
            `${key} IN (${conditionValue
              .map((val) => {
                if (typeof val === "string") {
                  return `'${val}'`;
                }
                return val;
              })
              .join(", ")})`
          );
          break;
        case "notIn":
          if (!Array.isArray(conditionValue)) {
            throw new Error("NOT IN condition value must be an array.");
          }
          conditions.push(
            `${key} NOT IN (${conditionValue
              .map((val) => {
                if (typeof val === "string") {
                  return `'${val}'`;
                }
                return val;
              })
              .join(", ")})`
          );
          break;
        case "like":
          if (typeof conditionValue !== "string") {
            throw new Error("LIKE condition value must be a string.");
          }
          conditions.push(`${key} LIKE '%${conditionValue}%'`);
          break;
        case "join":
          if (typeof conditionValue !== "object" || conditionValue === null) {
            throw new Error("JOIN condition value must be an object.");
          }
          for (const [table, joinCondition] of Object.entries(value.join)) {
            joinClauses.push(
              `JOIN ${table} ON ${Object.keys(joinCondition)[0]} = ${
                joinCondition[Object.keys(joinCondition)[0]]
              }`
            );
          }
          break;
        case "leftJoin":
          for (const [table, joinCondition] of Object.entries(value.leftJoin)) {
            joinClauses.push(
              `LEFT JOIN ${table} ON ${Object.keys(joinCondition)[0]} = ${
                joinCondition[Object.keys(joinCondition)[0]]
              }`
            );
          }
          break;
        case "rightJoin":
          for (const [table, joinCondition] of Object.entries(value.rightJoin)) {
            joinClauses.push(
              `RIGHT JOIN ${table} ON ${Object.keys(joinCondition)[0]} = ${
                joinCondition[Object.keys(joinCondition)[0]]
              }`
            );
          }
          break;
        default:
          throw new Error(`Invalid condition operator: ${conditionOperator}`);
      }
      if (operator) {
        if (typeof conditionValue === "string") {
          conditions.push(`${key} ${operator} '${conditionValue}'`);
        } else {
          conditions.push(`${key} ${operator} ${conditionValue}`);
        }
      }
      return {
        key: key,
        value: value,
        joinClauses: joinClauses,
        conditions: conditions,
      };
    }
    /**
     * 获取json字符串二维数组查询语句 mysql语句中的 JSON_ARRAYAGG(JSON_OBJECT(字段))函数
     * @param {*} alias 字段别名
     * @param {*} primaryKey
     * @param {*} foreignKey
     * @returns
     */
    hasMany(alias, primaryKeys, foreignKeys) {
      var query = new QueryBuilder();
      var arr = {
        alias: alias,
        selectSQL: "JSON_ARRAYAGG",
        primaryKey: primaryKeys,
        foreignKey: foreignKeys,
      };
      query.subqueryArr = arr;
      return query;
    }
  
    /**
     * 获取json字符串对象数据语句  mysql语句中的 JSON_OBJECT函数
     * @param {*} alias 字段别名
     * @param {*} primaryKey
     * @param {*} foreignKey
     * @returns
     */
    hasOne(alias, primaryKeys, foreignKeys) {
      var query = new QueryBuilder();
      var arr = {
        alias: alias,
        selectSQL: "JSON_OBJECT",
        primaryKey: primaryKeys,
        foreignKey: foreignKeys,
      };
      query.subqueryArr = arr;
      return query;
    }
    /**
     * 生成可插入(单条或者多条)数据 的sql语句
     * @param {*} tableName
     * @param {*} data
     * @returns
     */
    generateInsertSQL(tableName, data) {
      if (!data || (typeof data !== "object" && !Array.isArray(data))) {
        throw new Error(
          "Invalid insert data format. Please provide a valid object or array for insertion."
        );
      }
  
      let insertData;
      if (Array.isArray(data)) {
        if (data.length === 0) {
          throw new Error("Array insert data must contain at least one item.");
        }
        const firstItem = data[0];
        const columns = Object.keys(firstItem).join(", ");
        const values = data
          .map((item) => {
            if (typeof item !== "object" || Array.isArray(item)) {
              throw new Error(
                "Invalid array insert data format. Each item in the array must be an object."
              );
            }
            return (
              "(" +
              Object.values(item)
                .map((value) => {
                  if (typeof value === "string") {
                    return `'${value}'`;
                  }
                  return value;
                })
                .join(", ") +
              ")"
            );
          })
          .join(", ");
  
        insertData = `INSERT INTO ${tableName} (${columns}) VALUES ${values};`;
      } else {
        if (typeof data !== "object" || Array.isArray(data)) {
          throw new Error(
            "Invalid insert data format. Please provide a valid object for insertion."
          );
        }
  
        const columns = Object.keys(data).join(", ");
        const values = Object.values(data)
          .map((value) => {
            if (typeof value === "string") {
              return `'${value}'`;
            }
            return value;
          })
          .join(", ");
  
        insertData = `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
      }
  
      return insertData;
    }
  
    /**
     * 生成可以带条件修改的sql语句
     * @param {*} tableName
     * @param {*} data
     * @param {*} condition
     * @returns
     */
    generateUpdateSQL(tableName, data, condition) {
      let updateData = "";
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
          updateData += `${key} = '${value}', `;
        } else {
          updateData += `${key} = ${value}, `;
        }
      }
      updateData = updateData.slice(0, -2); // Remove trailing comma and space
  
      let whereCondition = "";
      if (condition.length == 1) {
        whereCondition = " WHERE " + condition.join(" ");
      } else if (condition.length > 1) {
        whereCondition = " WHERE " + condition.join(" AND ");
      }
      return `UPDATE ${tableName} SET ${updateData} ${whereCondition};`;
    }
    generateCaseWhere(conditions) {
      if (!Array.isArray(conditions) || conditions.length === 0) {
        return "";
      }
  
      const cases = conditions.map((condition) => {
        if (typeof condition === "string") {
          return `WHEN ${condition} THEN 1`;
        } else if (Array.isArray(condition) && condition.length === 2) {
          return `WHEN ${condition[0]} = ${condition[1]} THEN 1`;
        } else {
          throw new Error("Invalid condition format.");
        }
      });
  
      return `CASE ${cases.join(" ")} ELSE 0 END`;
    }
  
    /**
     * 生成删除语句
     * @param {*} tableName
     * @param {*} condition
     * @returns
     */
    generateDeleteSQL(tableName, condition) {
      let whereCondition = "";
      if (condition.length == 1) {
        whereCondition = " WHERE " + condition.join(" ");
      } else if (condition.length > 1) {
        whereCondition = " WHERE " + condition.join(" AND ");
      }
  
      return `DELETE FROM ${tableName} ${whereCondition};`;
    }
    //这个可以作为执行查询语句
    toArray() {
      // 在这里执行查询操作并返回结果数组
      // 这里只是一个示例，实际上你需要根据你的数据库连接来执行查询操作
      // const sql = this.get();
      // // 假设这里执行查询操作并返回结果数组
      // const resultArray = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
      // return resultArray;
    }
  
    //订单商品税费计算记录
    OrderTaxLogs(columnMapping) {
      var data = {
        id: "order_tax_logs.id",
        orders_id: "order_tax_logs.orders_id",
        goods_id: "order_tax_logs.goods_id",
        goods_name: "order_tax_logs.goods_name",
        staff_id: "order_tax_logs.staff_id",
        staff_name: "order_tax_logs.staff_name",
        tax: "order_tax_logs.tax",
        goods_price: "order_tax_logs.goods_price",
        goods_number: "order_tax_logs.goods_number",
        pay_type: "order_tax_logs.pay_type",
        created_at: "order_tax_logs.created_at",
        updated_at: "order_tax_logs.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
    //会员套餐购买记录
    OrderTaoCans(columnMapping) {
      var data = {
        id: "order_tao_cans.id",
        orders_id: "order_tao_cans.orders_id",
        member_code: "order_tao_cans.member_code",
        goods_id: "order_tao_cans.goods_id",
        goods_name: "order_tao_cans.goods_name",
        raw_price: "order_tao_cans.raw_price",
        taocan_total: "order_tao_cans.taocan_total",
        taocan_number: "order_tao_cans.taocan_number",
        created_at: "order_tao_cans.created_at",
        updated_at: "order_tao_cans.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
    //金额退款记录
    OrderRefundPrices(columnMapping) {
      var data = {
        id: "order_refund_prices.id",
        orders_id: "order_refund_prices.orders_id",
        goods_id: "order_refund_prices.goods_id",
        name: "order_refund_prices.name",
        price: "order_refund_prices.price",
        created_at: "order_refund_prices.created_at",
        updated_at: "order_refund_prices.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
    //积分兑换的商品记录
    OrderPointGoods(columnMapping) {
      var data = {
        id: "order_point_goods.id",
        orders_id: "order_point_goods.orders_id",
        member_code: "order_point_goods.member_code",
        goods_id: "order_point_goods.goods_id",
        goods_name: "order_point_goods.goods_name",
        point: "order_point_goods.point",
        number: "order_point_goods.number",
        created_at: "order_point_goods.created_at",
        updated_at: "order_point_goods.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
    //会员卡充值记录
    OrderMemberCards(columnMapping) {
      var data = {
        id: "order_member_cards.id",
        orders_id: "order_member_cards.orders_id",
        pay_type: "order_member_cards.pay_type",
        code: "order_member_cards.code",
        recharge_amount: "order_member_cards.recharge_amount",
        pay_amount: "order_member_cards.pay_amount",
        state: "order_member_cards.state",
        created_at: "order_member_cards.created_at",
        updated_at: "order_member_cards.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
    //现金券充值记录
    OrderCashCoupons(columnMapping) {
      var data = {
        id: "order_cash_coupons.id",
        orders_id: "order_cash_coupons.orders_id",
        code: "order_cash_coupons.code",
        recharge_amount: "order_cash_coupons.recharge_amount",
        pay_amount: "order_cash_coupons.pay_amount",
        begin_time: "order_cash_coupons.begin_time",
        end_time: "order_cash_coupons.end_time",
        is_print: "order_cash_coupons.is_print",
        state: "order_cash_coupons.state",
        created_at: "order_cash_coupons.created_at",
        updated_at: "order_cash_coupons.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
    //信用卡支付记录
    OrderCardLogs(columnMapping) {
      var data = {
        id: "order_card_logs.id",
        orders_id: "order_card_logs.orders_id",
        state: "order_card_logs.state",
        pay_type: "order_card_logs.pay_type",
        order_type: "order_card_logs.order_type",
        price: "order_card_logs.price",
        card_json: "order_card_logs.card_json",
        created_at: "order_card_logs.created_at",
        updated_at: "order_card_logs.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
  
    //会员信息
    MembersInfo(columnMapping) {
      var data = {
        id: "members.id",
        staff_id: "members.staff_id",
        name: "members.name",
        sex: "members.sex",
        code: "members.code",
        phone: "members.phone",
        email: "members.email",
        first_name: "members.first_name",
        last_name: "members.last_name",
        birthday: "members.birthday",
        referrer_name: "members.referrer_name",
        grades_id: "members.grades_id",
        balance: "members.balance",
        point: "members.point",
        notice_type: "members.notice_type",
        remark: "members.remark",
        created_at: "members.created_at",
        updated_at: "members.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
    //订单商品表
    OrderGoods(columnMapping) {
      var data = {
        id: "order_goods.id",
        orders_id: "order_goods.orders_id",
        goods_id: "order_goods.goods_id",
        goods_categorys_id: "order_goods.goods_categorys_id",
        goods_name: "order_goods.goods_name",
        raw_price: "order_goods.raw_price",
        number: "order_goods.number",
        custom_price: "order_goods.custom_price",
        tax_number: "order_goods.tax_number",
        created_at: "order_goods.created_at",
        updated_at: "order_goods.updated_at",
      };
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        this.columnMapping = { ...data, ...columnMapping };
      }
      return this;
    }
  
    //订单小费表
    OrderTips(columnMapping, column = true) {
      var data = {
        id: "order_tips.id",
        orders_id: "order_tips.orders_id",
        staff_id: "order_tips.staff_id",
        tip_total: "order_tips.tip_total",
        tip_rate: "order_tips.tip_rate",
        price: "order_tips.price",
        state: "order_tips.state",
        jiesuan_state: "order_tips.jiesuan_state",
        created_at: "order_tips.created_at",
        updated_at: "order_tips.updated_at",
      };
  
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        if (column) {
          this.columnMapping = { ...data, ...columnMapping };
        } else {
          this.columnMapping = columnMapping;
        }
      }
      return this;
    }
    //订单员工提成表
    OrderPushMoney(columnMapping, column = true) {
      var data = {
        id: "order_push_money.id",
        orders_id: "order_push_money.orders_id",
        code: "order_push_money.code",
        staff_name: "order_push_money.staff_name",
        goods_name: "order_push_money.goods_name",
        goods_id: "order_push_money.goods_id",
        goods_number: "order_push_money.goods_number",
        raw_price: "order_push_money.raw_price",
        ticheng_type: "order_push_money.ticheng_type",
        ticheng_js: "order_push_money.ticheng_js",
        tichang_price_type: "order_push_money.tichang_price_type",
        state: "order_push_money.state",
        tichang_price: "order_push_money.tichang_price",
        practical_price: "order_push_money.practical_price",
        total_price: "order_push_money.total_price",
        created_at: "order_push_money.created_at",
        updated_at: "order_push_money.updated_at",
      };
  
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        if (column) {
          this.columnMapping = { ...data, ...columnMapping };
        } else {
          this.columnMapping = columnMapping;
        }
      }
      return this;
    }
    //员工签到记录表
    StoreStaffSignIns(columnMapping, column = true) {
      var data = {
        id: "store_staff_sign_ins.id",
        name: "store_staff_sign_ins.name",
        code: "store_staff_sign_ins.code",
        date_time: "store_staff_sign_ins.date_time",
        begin_time: "store_staff_sign_ins.begin_time",
        end_time: "store_staff_sign_ins.end_time",
        working_hours: "store_staff_sign_ins.working_hours",
        time_wage: "store_staff_sign_ins.time_wage",
        created_at: "store_staff_sign_ins.created_at",
        updated_at: "store_staff_sign_ins.updated_at",
      };
  
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        if (column) {
          this.columnMapping = { ...data, ...columnMapping };
        } else {
          this.columnMapping = columnMapping;
        }
      }
      return this;
    }
    /** 预约表 */
    Subscribes(columnMapping, column = true) {
      var data = {
        id: "subscribes.id",
        orders_id: "subscribes.orders_id",
        name: "subscribes.name",
        phone: "subscribes.phone",
        date_time: "subscribes.date_time",
        begin_time: "subscribes.begin_time",
        end_time: "subscribes.end_time",
        time_strleng: "subscribes.time_strleng",
        staff_id: "subscribes.staff_id",
        is_appoint: "subscribes.is_appoint",
        remark: "subscribes.remark",
        created_at: "subscribes.created_at",
        updated_at: "subscribes.updated_at",
      };
  
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        if (column) {
          this.columnMapping = { ...data, ...columnMapping };
        } else {
          this.columnMapping = columnMapping;
        }
      }
      return this;
    }
  
    //权限
    StoreRoles(columnMapping, column = true) {
      var data = {
        id: "store_staff_roles.id",
        name: "store_staff_roles.name",
        store_id: "store_staff_roles.store_id",
        sign: "store_staff_roles.sign",
        menu_str_admin: "store_staff_roles.menu_str_admin",
        menu_str_app: "store_staff_roles.menu_str_app",
        state: "store_staff_roles.state",
        deleted_at: "store_staff_roles.deleted_at",
        created_at: "store_staff_roles.created_at",
        updated_at: "store_staff_roles.updated_at",
      };
  
      if (columnMapping == undefined || typeof columnMapping !== "object") {
        this.columnMapping = data;
      } else {
        if (column) {
          this.columnMapping = { ...data, ...columnMapping };
        } else {
          this.columnMapping = columnMapping;
        }
      }
      return this;
    }
  }
  var Models = new QueryBuilder();
  export default Models;
  