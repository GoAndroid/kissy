function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js']) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'] = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[10] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[15] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[16] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[17] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[18] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[19] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[22] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103] = 0;
}
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['9'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['9'][2] = new BranchData();
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['96'] = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['96'][1] = new BranchData();
}
_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['96'][1].init(5336, 10, 'moduleWrap');
function visit22_96_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['9'][2].init(165, 29, 'typeof module !== "undefined"');
function visit21_9_2(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['9'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['9'][1].init(165, 45, 'typeof module !== "undefined" && module.kissy');
function visit20_9_1(result) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[4]++;
  return function(scope, S, undefined) {
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[5]++;
  var buffer = "", config = this.config, engine = this, moduleWrap, utils = config.utils;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[9]++;
  if (visit20_9_1(visit21_9_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[10]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[12]++;
  var runBlockCommandUtil = utils.runBlockCommand, getExpressionUtil = utils.getExpression, getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[15]++;
  buffer += '<div class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[16]++;
  var config1 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[17]++;
  var params2 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[18]++;
  params2.push('header');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[19]++;
  config1.params = params2;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[20]++;
  var id0 = getPropertyOrRunCommandUtil(engine, scope, config1, "getBaseCssClasses", 0, 1, true, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[21]++;
  buffer += id0;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[22]++;
  buffer += '">\n    <a id="ks-date-picker-month-panel-previous-year-btn-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[23]++;
  var id3 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 2, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[24]++;
  buffer += getExpressionUtil(id3, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[25]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[26]++;
  var config5 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[27]++;
  var params6 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[28]++;
  params6.push('prev-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[29]++;
  config5.params = params6;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[30]++;
  var id4 = getPropertyOrRunCommandUtil(engine, scope, config5, "getBaseCssClasses", 0, 3, true, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[31]++;
  buffer += id4;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[32]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[33]++;
  var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "previousYearLabel", 0, 6, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[34]++;
  buffer += getExpressionUtil(id7, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[35]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n\n\n        <a class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[36]++;
  var config9 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[37]++;
  var params10 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[38]++;
  params10.push('year-select');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[39]++;
  config9.params = params10;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[40]++;
  var id8 = getPropertyOrRunCommandUtil(engine, scope, config9, "getBaseCssClasses", 0, 11, true, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[41]++;
  buffer += id8;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[42]++;
  buffer += '"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[43]++;
  var id11 = getPropertyOrRunCommandUtil(engine, scope, {}, "yearSelectLabel", 0, 15, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[44]++;
  buffer += getExpressionUtil(id11, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[45]++;
  buffer += '"\n           id="ks-date-picker-month-panel-year-select-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[46]++;
  var id12 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 16, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[47]++;
  buffer += getExpressionUtil(id12, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[48]++;
  buffer += '">\n            <span id="ks-date-picker-month-panel-year-select-content-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[49]++;
  var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 17, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[50]++;
  buffer += getExpressionUtil(id13, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[51]++;
  buffer += '">';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[52]++;
  var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "year", 0, 17, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[53]++;
  buffer += getExpressionUtil(id14, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[54]++;
  buffer += '</span>\n            <span class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[55]++;
  var config16 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[56]++;
  var params17 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[57]++;
  params17.push('year-select-arrow');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[58]++;
  config16.params = params17;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[59]++;
  var id15 = getPropertyOrRunCommandUtil(engine, scope, config16, "getBaseCssClasses", 0, 18, true, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[60]++;
  buffer += id15;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[61]++;
  buffer += '">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[62]++;
  var id18 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 21, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[63]++;
  buffer += getExpressionUtil(id18, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[64]++;
  buffer += '"\n       class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[65]++;
  var config20 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[66]++;
  var params21 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[67]++;
  params21.push('next-year-btn');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[68]++;
  config20.params = params21;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[69]++;
  var id19 = getPropertyOrRunCommandUtil(engine, scope, config20, "getBaseCssClasses", 0, 22, true, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[70]++;
  buffer += id19;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[71]++;
  buffer += '"\n       href="#"\n       role="button"\n       title="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[72]++;
  var id22 = getPropertyOrRunCommandUtil(engine, scope, {}, "nextYearLabel", 0, 25, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[73]++;
  buffer += getExpressionUtil(id22, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[74]++;
  buffer += '"\n       hidefocus="on">\n    </a>\n</div>\n<div class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[75]++;
  var config24 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[76]++;
  var params25 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[77]++;
  params25.push('body');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[78]++;
  config24.params = params25;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[79]++;
  var id23 = getPropertyOrRunCommandUtil(engine, scope, config24, "getBaseCssClasses", 0, 29, true, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[80]++;
  buffer += id23;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[81]++;
  buffer += '">\n    <table class="';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[82]++;
  var config27 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[83]++;
  var params28 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[84]++;
  params28.push('table');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[85]++;
  config27.params = params28;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[86]++;
  var id26 = getPropertyOrRunCommandUtil(engine, scope, config27, "getBaseCssClasses", 0, 30, true, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[87]++;
  buffer += id26;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[88]++;
  buffer += '" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[89]++;
  var id29 = getPropertyOrRunCommandUtil(engine, scope, {}, "id", 0, 31, undefined, false);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[90]++;
  buffer += getExpressionUtil(id29, true);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[91]++;
  buffer += '">\n        ';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[92]++;
  var config31 = {};
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[93]++;
  var params32 = [];
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[94]++;
  params32.push('date/picker/month-panel/months-xtpl');
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[95]++;
  config31.params = params32;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[96]++;
  if (visit22_96_1(moduleWrap)) {
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[97]++;
    require("date/picker/month-panel/months-xtpl");
    _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[98]++;
    config31.params[0] = moduleWrap.resolveByName(config31.params[0]);
  }
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[100]++;
  var id30 = getPropertyOrRunCommandUtil(engine, scope, config31, "include", 0, 32, false, undefined);
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[101]++;
  buffer += id30;
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[102]++;
  buffer += '\n        </tbody>\n    </table>\n</div>';
  _$jscoverage['/picker/month-panel/month-panel-xtpl.js'].lineData[103]++;
  return buffer;
};
});
