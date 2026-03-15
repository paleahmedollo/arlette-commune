const User = require('./User');
const Commune = require('./Commune');
const Structure = require('./Structure');
const Category = require('./Category');
const Report = require('./Report');
const Message = require('./Message');
const Notification = require('./Notification');

// User <-> Commune
User.belongsTo(Commune, { foreignKey: 'commune_id', as: 'commune' });
Commune.hasMany(User, { foreignKey: 'commune_id', as: 'users' });

// User <-> Structure
User.belongsTo(Structure, { foreignKey: 'structure_id', as: 'structure' });
Structure.hasMany(User, { foreignKey: 'structure_id', as: 'agents' });

// Structure <-> Commune
Structure.belongsTo(Commune, { foreignKey: 'commune_id', as: 'commune' });
Commune.hasMany(Structure, { foreignKey: 'commune_id', as: 'structures' });

// Report <-> User (citoyen)
Report.belongsTo(User, { foreignKey: 'user_id', as: 'citizen' });
User.hasMany(Report, { foreignKey: 'user_id', as: 'reports' });

// Report <-> Commune
Report.belongsTo(Commune, { foreignKey: 'commune_id', as: 'commune' });
Commune.hasMany(Report, { foreignKey: 'commune_id', as: 'reports' });

// Report <-> Structure
Report.belongsTo(Structure, { foreignKey: 'structure_id', as: 'structure' });
Structure.hasMany(Report, { foreignKey: 'structure_id', as: 'reports' });

// Report <-> Category
Report.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Report, { foreignKey: 'category_id', as: 'reports' });

// Message <-> Report
Message.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });
Report.hasMany(Message, { foreignKey: 'report_id', as: 'messages' });

// Message <-> User
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Notification <-> User
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Notification <-> Report
Notification.belongsTo(Report, { foreignKey: 'report_id', as: 'report' });

module.exports = { User, Commune, Structure, Category, Report, Message, Notification };
