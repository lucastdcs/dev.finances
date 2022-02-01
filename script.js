const modal = {
    open() {
        document.querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        document.querySelector('.modal-overlay')
            .classList.remove('active')
    }
}
const storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
    },

    set(transaction) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transaction))
    }
}

const transaction = []

const Transactions = {
    all: storage.get(),

    add(transactions) {
        Transactions.all.push(transactions)
        App.reload()
    },

    remove(index) {
        Transactions.all.splice(index, 1),
            App.reload()
    },

    incomes() {
        let income = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses() {
        let expense = 0;
        Transactions.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total() {
        return Transactions.incomes() + Transactions.expenses()
    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {

        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
        <td>${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td>${transaction.date}</td>
        <td>
            <img onclick="Transactions.remove(${index})" src="assets/minus.svg" alt="Remover Transações">
        </td>
    `
        return html
    },

    updateBalance() {
        document.querySelector("#incomeDisplay").innerHTML = Utils.formatCurrency(Transactions.incomes()),
            document.querySelector("#expenseDisplay").innerHTML = Utils.formatCurrency(Transactions.expenses()),
            document.querySelector("#totalDisplay").innerHTML = Utils.formatCurrency(Transactions.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },

    formatAmount(value) {
        value = Number(value) * 100
        console.log(value)

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}


const form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: form.description.value,
            amount: form.amount.value,
            date: form.date.value,
        }
    },

    validateFields() {
        const { description, amount, date } = form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    saveTransaction() {
        Transactions.add(transaction)
    },

    clearFields() {
        form.description.value = ""
        form.amount.value = ""
        form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            form.validateFields()
            const transaction = form.formatValues()
            Transactions.add(transaction)
            form.clearFields()
            modal.close()

        } catch (error) {
            alert(error.message)
        }
    }
}
const App = {
    init() {

        Transactions.all.forEach(DOM.addTransaction)


        DOM.updateBalance()

        storage.set(Transactions.all)
    },



    reload() {
        DOM.clearTransactions()
        App.init()
    }

}

App.init()