export default (sequelize, DataTypes) =>
    sequelize.define('Teacher', {
        name: DataTypes.STRING,
        password_hash: DataTypes.STRING,
        email: DataTypes.STRING,
        department: DataTypes.STRING
    });
