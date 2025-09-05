import jwt from 'jsonwebtoken';

export const userAuthByid = (token) => {
    try {
        const tokendecone = jwt.decode(token, process.env.SECRET_KEY_USER);
        if(!tokendecone.id){
            return null;
        }
        return tokendecone.id;
    } catch (error) {
        console.log(error);
        return null;
    }

}