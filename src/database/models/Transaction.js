const TransactionStatus = require('./TransactionStatus');

module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        vendor: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.ENUM,
            values: [TransactionStatus.PENDING, TransactionStatus.CLEARED, TransactionStatus.RECONCILED],
            defaultValue: TransactionStatus.PENDING
        }
    });

    Transaction.associate = function(models) {
        Transaction.Account = Transaction.belongsTo(models.Account);
        Transaction.Category = Transaction.belongsTo(models.Category);
    };

    Transaction.prototype.toJson = function() {
        console.log(this);
        return {
            id: this.id,
            vendor: this.vendor,
            date: Math.round(this.date.getTime()/1000),
            amount: this.amount,
            status: this.status,
            category: this.Category ? this.Category.toJson() : "None",
            links: {
                self: `/transactions/${this.id}`,
                account: `/accounts/${this.AccountId}`
            }
        }
    };

    return Transaction;
};