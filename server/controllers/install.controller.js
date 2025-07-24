// * for table installation

// ` import install service to handle communication with data base

const installService = require("../services/install.service")

// ` create a function to handle the install request
async function install (req, res, next) {
        // ` call the install service to create the tables
        // ` store install message so we will know if there is failure.
        const installMessage = await installService.install()

        // ` check if the install was successful or not and send the appropriate message to the client
        if (installMessage.status === 200) {
            // ` if successful, send a success message
                res.status(200).json({
                    message: installMessage
                })
        } else {
            // ` if not successful, send a failure message
                res.status(500).json({
                    message: installMessage
                })
        }
}


// ` export the install function to use in the install route

module.exports = {
    install
}