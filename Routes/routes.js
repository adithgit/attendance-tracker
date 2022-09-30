
const router = require('express').Router();
const User = require('../Models/user');


//get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send("index", { users });
    } catch (error) {
        res.status(200).send({ message: "Empty user list" });
    }
});


// Add users
router.post('/users', async (req, res) => {
    try {
        if (req.body.name === "") {
            return res.status(400).send('error', 'Name cannot be empty');
        }
        const user = new User(req.body);
        await user.save();
        res.status(200).send({message:`${user.name} has been added with id : ${user._id}`});
    } catch (error) {
        res.status(500).send({ message: 'Something went wrong' });
    }

})

// get user profile with the total work hours 
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        let hours = 0;
        if (user.attendance.length > 0) {
            user.attendance.reverse();
            user.attendance.map(a => {
                if (a.entry && a.exit.time) {
                    hours = hours + calculateHours(a.entry.getTime(), a.exit.time.getTime());
                }
            })
            hours = parseFloat(hours / (3600 * 1000)).toFixed(4);
        }

        res.status(200).send({"user":{ user, hours }});
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: 'Cannot find user' });
    }
});

// Get an overview of a particular user
router.get('/user/:id/overview', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const overview = generateUserOverview(user);
        overview.reverse();
        res.status(200).send({data:{ overview, user }});

    } catch (error) {
        console.log(error);
        res.status(500).send({"message":'could not create an overview'});
    }

})

//the overview of all users
router.get('/overview', async (req, res) => {
    try {
        const users = await User.find()
        const overview = generateOverview(users);
        res.render('overview', { overview })
    } catch (error) {
        console.log(error);
    }
})



//check in
router.post("/user/:id/enter", async (req, res) => {
    try {
        const data = {
            entry: Date.now()
        };
        const user = await User.findById(req.params.id);

        //if the user has an attendance array;
        if (user.attendance && user.attendance.length > 0) {
            //for a new checkin attendance, the last checkin
            const lastCheckIn = user.attendance[user.attendance.length - 1];
            console.log(lastCheckIn);
            if(!lastCheckIn.exit.time) return res.status(400).send({message:'already signed in.'});
            user.attendance.push(data);
            await user.save();
            return res.status(200).send({message:'signed in.'});
        } else {
            user.attendance.push(data);
            await user.save();    
            return res.status(200).send({message:'signed in.'});
        }

    } catch (error) {
        return res.status(500).send({message:'something went wrong.'});
    }
});


// check out for user
router.post("/user/:id/exit", async (req, res) => {
    // the attendance than can be checked out must be last entry in the attendance array
    try {
        const user = await User.findOne({ _id: req.params.id });
        //check if there is an attendance entry
        if (user.attendance && user.attendance.length > 0) {

            //check whether the exit time of the last element of the attedance entry has a value
            const lastAttendance = user.attendance[user.attendance.length - 1];
            if (lastAttendance.exit.time) {
                return res.status(400).send({message:'already signed out today.'});
                
            }
            lastAttendance.exit.time = Date.now();
            lastAttendance.exit.reason = req.body.reason;
            await user.save();
            return res.status(200).send({message:'successfully signed out.'});
        } else { //if no entry
            return res.status(400).send({message:'Not signed in.'});
        }
    } catch (error) {
        return res.status(400).send({message:'something went wrong.'});
    }
});


function calculateHours(entryTime, exitTime) {
    let time = 0;
    time = time + (exitTime - entryTime);
    return time;
}

function generateOverview(users) {
    //map over the users array  and return something like
    const overview = []
    users.map(user => {
        let hours = 0;
        if (user.attendance.length > 0) {
            user.attendance.map(a => {
                if (a.entry && a.exit.time) {
                    hours = hours + calculateHours(a.entry.getTime(), a.exit.time.getTime());
                }

            })
            hours = parseFloat(hours / (3600 * 1000)).toFixed(4);
            overview.push({ user, hours })
        }
    })
    return overview;
}

function generateUserOverview(user) {
    const overview = [];
    if(user.attendance.length === 0) throw new Error();
    user.attendance.map(a => {
        overview.push({
            date: a.date,
            entry: a.entry,
            exit: a.exit.time,
            reason: a.exit.reason
        })
    })
    return overview;
}

module.exports = router;