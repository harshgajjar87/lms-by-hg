const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

const books = [
  {'title':'Introduction to Algorithms','author':'Thomas H. Cormen','publication':'MIT Press','category':'Computer Science','isbn':'978-0262033848','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Clean Code','author':'Robert C. Martin','publication':'Prentice Hall','category':'Computer Science','isbn':'978-0132350884','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'The Pragmatic Programmer','author':'Andrew Hunt','publication':'Addison-Wesley','category':'Computer Science','isbn':'978-0201616224','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Design Patterns','author':'Gang of Four','publication':'Addison-Wesley','category':'Computer Science','isbn':'978-0201633610','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Code Complete','author':'Steve McConnell','publication':'Microsoft Press','category':'Computer Science','isbn':'978-0735619678','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Artificial Intelligence','author':'Stuart Russell','publication':'Pearson','category':'Computer Science','isbn':'978-0136042594','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Database System Concepts','author':'Abraham Silberschatz','publication':'McGraw-Hill','category':'Computer Science','isbn':'978-0073523323','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Operating System Concepts','author':'Abraham Silberschatz','publication':'Wiley','category':'Computer Science','isbn':'978-1119800361','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Thermodynamics','author':'Yunus A. Cengel','publication':'McGraw-Hill','category':'Mechanical Engineering','isbn':'978-0073398174','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Fluid Mechanics','author':'Frank M. White','publication':'McGraw-Hill','category':'Mechanical Engineering','isbn':'978-0073398273','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Heat Transfer','author':'Jack P. Holman','publication':'McGraw-Hill','category':'Mechanical Engineering','isbn':'978-0073529363','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Machine Design','author':'Robert L. Norton','publication':'Pearson','category':'Mechanical Engineering','isbn':'978-0133356717','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Materials Science','author':'William D. Callister','publication':'Wiley','category':'Mechanical Engineering','isbn':'978-1119405498','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Dynamics','author':'Meriam','publication':'Wiley','category':'Mechanical Engineering','isbn':'978-1118885840','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Strength of Materials','author':'Ferdinand Beer','publication':'McGraw-Hill','category':'Mechanical Engineering','isbn':'978-0073398242','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Manufacturing Processes','author':'Mikell P. Groover','publication':'Wiley','category':'Mechanical Engineering','isbn':'978-1119499251','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Electrical Machines','author':'Nagrath','publication':'McGraw-Hill','category':'Electrical Engineering','isbn':'978-0070682877','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Power Systems','author':'C.L. Wadhwa','publication':'New Age International','category':'Electrical Engineering','isbn':'978-8122430976','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Control Systems','author':'Norman Nise','publication':'Wiley','category':'Electrical Engineering','isbn':'978-1118170519','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Digital Electronics','author':'Morris Mano','publication':'Pearson','category':'Electrical Engineering','isbn':'978-0132543033','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Signals and Systems','author':'Oppenheim','publication':'Pearson','category':'Electrical Engineering','isbn':'978-0138147570','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Electromagnetic Theory','author':'Sadiku','publication':'Oxford','category':'Electrical Engineering','isbn':'978-0190491150','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Circuit Theory','author':'Hayt','publication':'McGraw-Hill','category':'Electrical Engineering','isbn':'978-0073529578','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Microprocessors','author':'Gaonkar','publication':'Penram','category':'Electrical Engineering','isbn':'978-8176568259','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Structural Analysis','author':'Hibbeler','publication':'Pearson','category':'Civil Engineering','isbn':'978-0133942842','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Concrete Technology','author':'Neville','publication':'Pearson','category':'Civil Engineering','isbn':'978-0273755807','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Geotechnical Engineering','author':'Braja Das','publication':'Cengage','category':'Civil Engineering','isbn':'978-8131526786','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Transportation Engineering','author':'Khanna','publication':'Nem Chand','category':'Civil Engineering','isbn':'978-8185249967','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Environmental Engineering','author':'Howard','publication':'Wiley','category':'Civil Engineering','isbn':'978-1118741498','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Surveying','author':'Bannister','publication':'Pearson','category':'Civil Engineering','isbn':'978-0582302490','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Water Resources','author':'Larry Mays','publication':'Wiley','category':'Civil Engineering','isbn':'978-1119491574','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Construction Management','author':'Halpin','publication':'Wiley','category':'Civil Engineering','isbn':'978-1119675228','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Communication Systems','author':'Haykin','publication':'Wiley','category':'Electronics and Communication Engineering','isbn':'978-1118098918','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Digital Signal Processing','author':'Proakis','publication':'Pearson','category':'Electronics and Communication Engineering','isbn':'978-0131873742','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Antenna Theory','author':'Balanis','publication':'Wiley','category':'Electronics and Communication Engineering','isbn':'978-1118642061','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'VLSI Design','author':'West','publication':'McGraw-Hill','category':'Electronics and Communication Engineering','isbn':'978-0070702536','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Optical Fiber Communication','author':'Keiser','publication':'McGraw-Hill','category':'Electronics and Communication Engineering','isbn':'978-0073380716','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Microwave Engineering','author':'Pozar','publication':'Wiley','category':'Electronics and Communication Engineering','isbn':'978-1119770604','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Embedded Systems','author':'Raj Kamal','publication':'McGraw-Hill','category':'Electronics and Communication Engineering','isbn':'978-0070667643','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Wireless Communication','author':'Rappaport','publication':'Pearson','category':'Electronics and Communication Engineering','isbn':'978-0130422323','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Data Structures','author':'Cormen','publication':'MIT Press','category':'Information Technology','isbn':'978-0262033848','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Computer Networks','author':'Tanenbaum','publication':'Pearson','category':'Information Technology','isbn':'978-0132126953','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Software Engineering','author':'Pressman','publication':'McGraw-Hill','category':'Information Technology','isbn':'978-0073375972','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Web Technologies','author':'Ivan Bayross','publication':'BPB','category':'Information Technology','isbn':'978-8176568877','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Cyber Security','author':'William Stallings','publication':'Pearson','category':'Information Technology','isbn':'978-0134815625','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Cloud Computing','author':'Rajkumar Buyya','publication':'Morgan Kaufmann','category':'Information Technology','isbn':'978-0123858801','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Big Data','author':'Viktor Mayer-Schonberger','publication':'Houghton Mifflin Harcourt','category':'Information Technology','isbn':'978-0544227750','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Machine Learning','author':'Tom Mitchell','publication':'McGraw-Hill','category':'Information Technology','isbn':'978-0070428072','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Chemical Reaction Engineering','author':'Octave Levenspiel','publication':'Wiley','category':'Chemical Engineering','isbn':'978-1119508399','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Process Control','author':'Donald Coughanowr','publication':'McGraw-Hill','category':'Chemical Engineering','isbn':'978-0070393622','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Mass Transfer','author':'Robert Treybal','publication':'McGraw-Hill','category':'Chemical Engineering','isbn':'978-0073397985','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Unit Operations','author':'McCabe','publication':'McGraw-Hill','category':'Chemical Engineering','isbn':'978-0072848236','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Organic Chemistry','author':'Clayden','publication':'Oxford','category':'Chemical Engineering','isbn':'978-0199270293','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Polymer Science','author':'Billmeyer','publication':'Wiley','category':'Chemical Engineering','isbn':'978-0471710433','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Biochemical Engineering','author':'Bailey','publication':'McGraw-Hill','category':'Chemical Engineering','isbn':'978-0073521462','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Petroleum Engineering','author':'Tarek Ahmed','publication':'Gulf Professional Publishing','category':'Chemical Engineering','isbn':'978-0123838468','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Aerodynamics','author':'Anderson','publication':'McGraw-Hill','category':'Aerospace Engineering','isbn':'978-0073398104','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Aircraft Structures','author':'Megson','publication':'Butterworth-Heinemann','category':'Aerospace Engineering','isbn':'978-0080969053','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Propulsion','author':'Hill','publication':'Cambridge','category':'Aerospace Engineering','isbn':'978-0521542447','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Flight Dynamics','author':'McLean','publication':'Cambridge','category':'Aerospace Engineering','isbn':'978-0521818381','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Spacecraft Systems','author':'Fortescue','publication':'Butterworth-Heinemann','category':'Aerospace Engineering','isbn':'978-0750667777','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Rocket Propulsion','author':'Sutton','publication':'Wiley','category':'Aerospace Engineering','isbn':'978-1119504148','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Avionics','author':'Collinson','publication':'Butterworth-Heinemann','category':'Aerospace Engineering','isbn':'978-0340741458','totalCopies':8,'availableCopies':8,'image':null},
  {'title':'Composite Materials','author':'Kaw','publication':'CRC Press','category':'Aerospace Engineering','isbn':'978-0849313538','totalCopies':8,'availableCopies':8,'image':null}
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  try {
    const result = await Book.insertMany(books, { ordered: false });
    console.log(`${result.length} books inserted successfully`);
  } catch (error) {
    console.error('Error inserting books:', error);
  } finally {
    mongoose.connection.close();
  }
})
.catch(err => console.log('Connection error:', err));
