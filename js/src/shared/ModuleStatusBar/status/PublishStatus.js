var BaseView = require('backend/Views/BaseControlView');
var tplPublishStatus = require('templates/backend/status/publish.hbs');
var Ajax = require('common/Ajax');
var Config = require('common/Config');
var I18n = require('common/I18n');
var Checks = require('common/Checks');

module.exports = BaseView.extend({
  id: 'publish',
  className: 'kb-status-draft',
  events: {
    'click': 'toggleDraft'
  },
  isValid: function () {

    if (!Checks.userCan(this.model.get('settings').cap)){
      return false;
    }

    if (KB.Environment && KB.Environment.postType === "kb-gmd" ){
      return false;
    }
    return true;
  },
  render: function () {
    var draft = this.model.get('state').draft;
    var $parent = this.model.View.$el;
    this.$el.append(tplPublishStatus({
      draft: this.model.get('state').draft,
      strings: I18n.getString('Modules.tooltips')
    }));
    if (draft) {
      $parent.addClass('kb-module-draft');
    } else {
      $parent.removeClass('kb-module-draft');
    }
  },
  toggleDraft: function () {
    var that = this;
    Ajax.send({
      action: 'undraftModule',
      module: this.model.toJSON(),
      _ajax_nonce: Config.getNonce('update')
    }).done(function () {
      that.model.get('state').draft = !that.model.get('state').draft;
      that.$el.empty();
      that.render();
      that.model.trigger('change:state', that.model.get('state'));
    });
  }

});