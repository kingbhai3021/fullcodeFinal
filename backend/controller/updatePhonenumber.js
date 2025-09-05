import { userAuthByid } from "../auth/userAuthByid.js";
import logins from "../model/logins.js";

// update phonenumber
export const Updatephonenumber = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            res.status(400).send({ message: "Token Not Found" });
        }
        const phone = req.body.phonenumber;
        if (!phone) {
            res.status(400).send({ message: "phone number not resived" });
        }
        const id = userAuthByid(tokenformCookie);
        if (id) {
            await logins.findOneAndUpdate({ _id: id }, { $set: { phonenumber: phone } })
            res.status(200).send({ message: "phonenumber updated successfully" })
        } else {
            res.status(400).send({ message: "user not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "something went wrong" });
    }
}


// get phonenumber
export const GetPhonenumber = async (req, res) => {
    try {
        const tokenformCookie = req.cookies.token;
        if (!tokenformCookie) {
            res.status(400).send({ message: "Token Not Found" });
        }
        const id = userAuthByid(tokenformCookie);
        if (id) {
            const user = await logins.findById(id);
            if (user) {
                res.status(200).send(user?.phonenumber)
            } else {
                res.status(400).send({ message: "user not found" });
            }
        } else {
            res.status(400).send({ message: "user not found" });
        }

    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "something went wrong" });
    }
}




// get phone numbner in application 

export const GetPhonenumberInApp = async (req, res) => {
    console.log("GetPhonenumberInApp called"); // Debug log
    try {
        console.log("Params:", req.params);   // Debug log
        const id = req.params?.userId;       // should be "68a42be486a3c24316bce190"

        const user = await logins.findById(id);
        if (user) {
            res.status(200).send(user.phonenumber);
        } else {
            res.status(404).send({ message: "user not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "something went wrong" });
    }
};
