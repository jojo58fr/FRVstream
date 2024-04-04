'use strict';

const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DiscordAuthentification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      /*this.hasMany(models.materialsics, {
        foreignKey: {name: 'user_create',allowNull: false}, as: "materialsic"
      })*/

      this.belongsTo(models.users, {
        foreignKey: {name: 'user_id',allowNull: true}
      })

    }
  }
  
  DiscordAuthentification.init({
    id_discord: 
    {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'discord_authentification',
  });
  
  return DiscordAuthentification;
};