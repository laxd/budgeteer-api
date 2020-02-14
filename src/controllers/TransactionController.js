const { check, query, validationResult } = require('express-validator');
const { Transaction, Account } = require('../database/models');

function toJson(transaction, accountId) {
    return {
        id: transaction.id,
        vendor: transaction.vendor,
        date: transaction.date,
        amount: transaction.amount,
        cleared: transaction.cleared,
        reconciled: transaction.reconciled,
        links: {
            self: `/transactions/${transaction.id}`,
            account: `/accounts/${accountId}`
        }
    }
}

exports.validate = () => {
    return [
        check('vendor').not().isEmpty(),
        check('amount').isNumeric(),
        check('date').not().isEmpty(),
        check('accountId', 'Account does not exist').custom(val => {
            return Account.findOne({
                where: {
                    id: val
                }
            }).then(account => {
                console.log(account);
                if(!account) {
                    return Promise.reject("Account does not exist");
                }
            });
        })
    ]
};

exports.validateAccountIdPresent = () => {
    return [
        query('accountId').not().isEmpty()
    ]
};

exports.get_transactions = (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422)
            .json({ errors: errors.array() });
    }

    Transaction
        .findAll({
            where: {
                accountId: req.query.accountId
            }
        })
        .then(transactions => {
            if(transactions) {
                res.status(200)
                    .json(transactions.map(transaction => toJson(transaction, req.query.accountId)));
            }
            else {
                res.status(404)
                    .json("Not found");
            }
        })
        .catch(error => {
            res.status(500)
                .json({ error: error.message });
        });
};

exports.add_transaction = (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422)
            .json({ errors: errors.array() });
    }

    Transaction
        .build({
            vendor: req.body.vendor,
            amount: req.body.amount,
            date: req.body.date,
            AccountId: req.body.accountId
        })
        .save()
        .then(transaction => {
            res.status(200)
                .json(toJson(transaction, req.body.accountId));
        })
        .catch(error => {
            res.status(500)
                .json({ error: error.message });
        });
};

exports.update_transaction = (req, res) => {
    // Find the given transaction first
    Transaction
        .findOne({
            where: {
                id: req.params.id
            }
        }).then(result => {
            // Only update the values that have actually changed and actually exist
            for(let key in req.body) {
                if(key in result) {
                    result[key] = req.body[key];
                }
            }

            result.save()
                .then(transaction => {
                        res.status(200)
                            .json(toJson(transaction, req.query.accountId));
                    })
        })
        .catch(error => {
            res.status(500)
                .json({ error: error.message });
        });

};


exports.delete_transaction = (req, res) => {
    Transaction
        .findOne({
            where: {
                id: req.params.id
            }
        })
        .then(result => {
            if(result) {
                result.destroy();
                res.status(200)
                    .json({ message: "Transaction deleted" });
            }
            else {
                res.status(404)
                    .json({ message: "Not found" });
            }
        })
        .catch(error => {
            res.status(500)
                .json({ error: error.message });
        });
};