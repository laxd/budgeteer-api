const { check, validationResult } = require('express-validator');

const getUrl = function(req) {
    return req.protocol + '://' + req.get('host') + "/budgets";
};

exports.validate = () => {
    return [
        check("name").not().isEmpty()
    ]
};

exports.get_all_budgets = (req, res) => {
    res.app.get('models').Budget
        .findAll()
        .then(budgets => {
            res.status(200)
                .json({
                    count: budgets.length,
                    budgets: budgets.map(budget => {
                        return {
                            id: budget.id,
                            name: budget.name,
                            request: {
                                method: "GET",
                                url: getUrl(req) + "/" + budget.id
                            }
                        }
                    })
                });
        });
};

exports.get_budget = (req, res) => {
    res.app.get('models').Budget
        .findOne({
            where: {
                id: req.params.id
            }
        })
        .then(budget => {
            if(budget) {
                res.status(200)
                    .json(budget)
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

exports.create_budget = (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        res.status(422)
            .json({ errors: errors.array() });
    }

    res.app.get('models').Budget
        .build({
            name: req.body.name
        })
        .save()
        .then(budget => {
            res.status(200)
                .json({
                    id: budget.id,
                    name: budget.name,
                    request: {
                        method: "GET",
                        url: getUrl(req) + "/" + budget.id
                    }
                });
        })
        .catch(error => {
            res.status(500)
                .json({ error: error.message });
        });
};

exports.update_budget = (req, res) => {
    res.app.get('models').Budget
        .findOne({
            where: {
                id: req.params.id
            }
        })
        .then(budget => {
            if(budget) {
                budget.name = req.body.name;
                budget.save();
                res.status(200)
                    .json({
                        id: budget.id,
                        name: budget.name,
                        request: {
                            method: "GET",
                            url: getUrl(req) + "/" + budget.id
                        }
                    });
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

exports.delete_budget = (req, res) => {
    res.app.get('models').Budget
        .findOne({
            where: {
                id: req.params.id
            }
        })
        .then(budget => {
            if(budget) {
                budget.destroy();
                res.status(200)
                    .json({ message: "Budget deleted" });
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