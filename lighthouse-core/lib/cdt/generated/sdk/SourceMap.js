'use strict';
/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
exports.__esModule = true;
/**
 * @interface
 */
const SourceMap = /** @class */ (function() {
  function SourceMap() {
  }
  /**
     * @return {string}
     */
  SourceMap.prototype.compiledURL = function() {
  };
  /**
     * @return {string}
     */
  SourceMap.prototype.url = function() {
  };
  /**
     * @return {!Array<string>}
     */
  SourceMap.prototype.sourceURLs = function() {
  };
  /**
     * @param {string} sourceURL
     * @param {!Common.ResourceType} contentType
     * @return {!Common.ContentProvider}
     */
  SourceMap.prototype.sourceContentProvider = function(sourceURL, contentType) {
  };
  /**
     * @param {string} sourceURL
     * @return {?string}
     */
  SourceMap.prototype.embeddedContentByURL = function(sourceURL) {
  };
  /**
     * @param {number} lineNumber in compiled resource
     * @param {number} columnNumber in compiled resource
     * @return {?SourceMapEntry}
     */
  SourceMap.prototype.findEntry = function(lineNumber, columnNumber) {
  };
  return SourceMap;
}());
exports['default'] = SourceMap;
/**
 * @unrestricted
 */
const SourceMapV3 = /** @class */ (function() {
  function SourceMapV3() {
    /** @type {number} */ this.version;
    /** @type {string|undefined} */ this.file;
    /** @type {!Array.<string>} */ this.sources;
    /** @type {!Array.<!SourceMapV3.Section>|undefined} */ this.sections;
    /** @type {string} */ this.mappings;
    /** @type {string|undefined} */ this.sourceRoot;
    /** @type {!Array.<string>|undefined} */ this.names;
  }
  return SourceMapV3;
}());
exports.SourceMapV3 = SourceMapV3;
/**
 * @unrestricted
 */
SourceMapV3.Section = /** @class */ (function() {
  function Section() {
    /** @type {!SourceMapV3} */ this.map;
    /** @type {!SourceMapV3.Offset} */ this.offset;
  }
  return Section;
}());
/**
 * @unrestricted
 */
SourceMapV3.Offset = /** @class */ (function() {
  function Offset() {
    /** @type {number} */ this.line;
    /** @type {number} */ this.column;
  }
  return Offset;
}());
/**
 * @unrestricted
 */
const SourceMapEntry = /** @class */ (function() {
  /**
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @param {string=} sourceURL
     * @param {number=} sourceLineNumber
     * @param {number=} sourceColumnNumber
     * @param {string=} name
     */
  function SourceMapEntry(lineNumber, columnNumber, sourceURL, sourceLineNumber, sourceColumnNumber, name) {
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
    this.sourceURL = sourceURL;
    this.sourceLineNumber = sourceLineNumber;
    this.sourceColumnNumber = sourceColumnNumber;
    this.name = name;
  }
  /**
     * @param {!SourceMapEntry} entry1
     * @param {!SourceMapEntry} entry2
     * @return {number}
     */
  SourceMapEntry.compare = function(entry1, entry2) {
    if (entry1.lineNumber !== entry2.lineNumber) {
      return entry1.lineNumber - entry2.lineNumber;
    }
    return entry1.columnNumber - entry2.columnNumber;
  };
  return SourceMapEntry;
}());
exports.SourceMapEntry = SourceMapEntry;
/**
 * @unrestricted
 */
const EditResult = /** @class */ (function() {
  /**
     * @param {!SourceMap} map
     * @param {!Array<!TextUtils.SourceEdit>} compiledEdits
     * @param {!Map<string, string>} newSources
     */
  function EditResult(map, compiledEdits, newSources) {
    this.map = map;
    this.compiledEdits = compiledEdits;
    this.newSources = newSources;
  }
  return EditResult;
}());
exports.EditResult = EditResult;
/**
 * @implements {SourceMap}
 * @unrestricted
 */
const TextSourceMap = /** @class */ (function() {
  /**
     * Implements Source Map V3 model. See https://github.com/google/closure-compiler/wiki/Source-Maps
     * for format description.
     * @param {string} compiledURL
     * @param {string} sourceMappingURL
     * @param {!SourceMapV3} payload
     */
  function TextSourceMap(compiledURL, sourceMappingURL, payload) {
    if (!TextSourceMap._base64Map) {
      const base64Digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      TextSourceMap._base64Map = {};
      for (let i = 0; i < base64Digits.length; ++i) {
        TextSourceMap._base64Map[base64Digits.charAt(i)] = i;
      }
    }
    this._json = payload;
    this._compiledURL = compiledURL;
    this._sourceMappingURL = sourceMappingURL;
    this._baseURL = sourceMappingURL.startsWith('data:') ? compiledURL : sourceMappingURL;
    /** @type {?Array<!SourceMapEntry>} */
    this._mappings = null;
    /** @type {!Map<string, !TextSourceMap.SourceInfo>} */
    this._sourceInfos = new Map();
    if (this._json.sections) {
      const sectionWithURL = !!this._json.sections.find(function(section) {
        return !!section.url;
      });
      if (sectionWithURL) {
        globalThis.cdt.Common.console.warn('SourceMap "' + sourceMappingURL + '" contains unsupported "URL" field in one of its sections.');
      }
    }
    this._eachSection(this._parseSources.bind(this));
  }
  /**
     * @param {string} sourceMapURL
     * @param {string} compiledURL
     * @return {!Promise<?TextSourceMap>}
     * @this {TextSourceMap}
     */
  TextSourceMap.load = function(sourceMapURL, compiledURL) {
    let callback;
    const promise = new Promise(function(fulfill) {
      return callback = fulfill;
    });
    globalThis.cdt.SDK.multitargetNetworkManager.loadResource(sourceMapURL, contentLoaded);
    return promise;
    /**
         * @param {number} statusCode
         * @param {!Object.<string, string>} headers
         * @param {string} content
         */
    function contentLoaded(statusCode, headers, content) {
      if (!content || statusCode >= 400) {
        callback(null);
        return;
      }
      if (content.slice(0, 3) === ')]}') {
        content = content.substring(content.indexOf('\n'));
      }
      try {
        const payload = /** @type {!SourceMapV3} */ (JSON.parse(content));
        callback(new TextSourceMap(compiledURL, sourceMapURL, payload));
      } catch (e) {
        console.error(e);
        globalThis.cdt.Common.console.warn('DevTools failed to parse SourceMap: ' + sourceMapURL);
        callback(null);
      }
    }
  };
  /**
     * @override
     * @return {string}
     */
  TextSourceMap.prototype.compiledURL = function() {
    return this._compiledURL;
  };
  /**
     * @override
     * @return {string}
     */
  TextSourceMap.prototype.url = function() {
    return this._sourceMappingURL;
  };
  /**
     * @override
     * @return {!Array.<string>}
     */
  TextSourceMap.prototype.sourceURLs = function() {
    return this._sourceInfos.keysArray();
  };
  /**
     * @override
     * @param {string} sourceURL
     * @param {!Common.ResourceType} contentType
     * @return {!Common.ContentProvider}
     */
  TextSourceMap.prototype.sourceContentProvider = function(sourceURL, contentType) {
    const info = this._sourceInfos.get(sourceURL);
    if (info.content) {
      return globalThis.cdt.Common.StaticContentProvider.fromString(sourceURL, contentType, info.content);
    }
    return new globalThis.cdt.SDK.CompilerSourceMappingContentProvider(sourceURL, contentType);
  };
  /**
     * @override
     * @param {string} sourceURL
     * @return {?string}
     */
  TextSourceMap.prototype.embeddedContentByURL = function(sourceURL) {
    if (!this._sourceInfos.has(sourceURL)) {
      return null;
    }
    return this._sourceInfos.get(sourceURL).content;
  };
  /**
     * @override
     * @param {number} lineNumber in compiled resource
     * @param {number} columnNumber in compiled resource
     * @return {?SourceMapEntry}
     */
  TextSourceMap.prototype.findEntry = function(lineNumber, columnNumber) {
    const mappings = this.mappings();
    const index = mappings.upperBound(undefined, function(unused, entry) {
      return lineNumber - entry.lineNumber || columnNumber - entry.columnNumber;
    });
    return index ? mappings[index - 1] : null;
  };
  /**
     * @param {string} sourceURL
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {?SourceMapEntry}
     */
  TextSourceMap.prototype.sourceLineMapping = function(sourceURL, lineNumber, columnNumber) {
    const mappings = this._reversedMappings(sourceURL);
    const first = mappings.lowerBound(lineNumber, lineComparator);
    const last = mappings.upperBound(lineNumber, lineComparator);
    if (first >= mappings.length || mappings[first].sourceLineNumber !== lineNumber) {
      return null;
    }
    const columnMappings = mappings.slice(first, last);
    if (!columnMappings.length) {
      return null;
    }
    const index = columnMappings.lowerBound(columnNumber, function(columnNumber, mapping) {
      return columnNumber - mapping.sourceColumnNumber;
    });
    return index >= columnMappings.length ? columnMappings[columnMappings.length - 1] : columnMappings[index];
    /**
         * @param {number} lineNumber
         * @param {!SourceMapEntry} mapping
         * @return {number}
         */
    function lineComparator(lineNumber, mapping) {
      return lineNumber - mapping.sourceLineNumber;
    }
  };
  /**
     * @param {string} sourceURL
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {!Array<!SourceMapEntry>}
     */
  TextSourceMap.prototype.findReverseEntries = function(sourceURL, lineNumber, columnNumber) {
    const mappings = this._reversedMappings(sourceURL);
    const endIndex = mappings.upperBound(undefined, function(unused, entry) {
      return lineNumber - entry.sourceLineNumber || columnNumber - entry.sourceColumnNumber;
    });
    let startIndex = endIndex;
    while (startIndex > 0 && mappings[startIndex - 1].sourceLineNumber === mappings[endIndex - 1].sourceLineNumber &&
            mappings[startIndex - 1].sourceColumnNumber === mappings[endIndex - 1].sourceColumnNumber) {
      --startIndex;
    }
    return mappings.slice(startIndex, endIndex);
  };
  /**
     * @return {!Array<!SourceMapEntry>}
     */
  TextSourceMap.prototype.mappings = function() {
    if (this._mappings === null) {
      this._mappings = [];
      this._eachSection(this._parseMap.bind(this));
      this._json = null;
    }
    return /** @type {!Array<!SourceMapEntry>} */ (this._mappings);
  };
  /**
     * @param {string} sourceURL
     * @return {!Array.<!SourceMapEntry>}
     */
  TextSourceMap.prototype._reversedMappings = function(sourceURL) {
    if (!this._sourceInfos.has(sourceURL)) {
      return [];
    }
    const mappings = this.mappings();
    const info = this._sourceInfos.get(sourceURL);
    if (info.reverseMappings === null) {
      info.reverseMappings = mappings.filter(function(mapping) {
        return mapping.sourceURL === sourceURL;
      }).sort(sourceMappingComparator);
    }
    return info.reverseMappings;
    /**
         * @param {!SourceMapEntry} a
         * @param {!SourceMapEntry} b
         * @return {number}
         */
    function sourceMappingComparator(a, b) {
      if (a.sourceLineNumber !== b.sourceLineNumber) {
        return a.sourceLineNumber - b.sourceLineNumber;
      }
      if (a.sourceColumnNumber !== b.sourceColumnNumber) {
        return a.sourceColumnNumber - b.sourceColumnNumber;
      }
      if (a.lineNumber !== b.lineNumber) {
        return a.lineNumber - b.lineNumber;
      }
      return a.columnNumber - b.columnNumber;
    }
  };
  /**
     * @param {function(!SourceMapV3, number, number)} callback
     */
  TextSourceMap.prototype._eachSection = function(callback) {
    if (!this._json.sections) {
      callback(this._json, 0, 0);
      return;
    }
    for (let _i = 0, _a = this._json.sections; _i < _a.length; _i++) {
      const section = _a[_i];
      callback(section.map, section.offset.line, section.offset.column);
    }
  };
  /**
     * @param {!SourceMapV3} sourceMap
     */
  TextSourceMap.prototype._parseSources = function(sourceMap) {
    const sourcesList = [];
    let sourceRoot = sourceMap.sourceRoot || '';
    if (sourceRoot && !sourceRoot.endsWith('/')) {
      sourceRoot += '/';
    }
    for (let i = 0; i < sourceMap.sources.length; ++i) {
      const href = sourceRoot + sourceMap.sources[i];
      let url = globalThis.cdt.Common.ParsedURL.completeURL(this._baseURL, href) || href;
      const source = sourceMap.sourcesContent && sourceMap.sourcesContent[i];
      if (url === this._compiledURL && source) {
        url += globalThis.cdt.Common.UIString('? [sm]');
      }
      this._sourceInfos.set(url, new TextSourceMap.SourceInfo(source, null));
      sourcesList.push(url);
    }
    sourceMap[TextSourceMap._sourcesListSymbol] = sourcesList;
  };
  /**
     * @param {!SourceMapV3} map
     * @param {number} lineNumber
     * @param {number} columnNumber
     */
  TextSourceMap.prototype._parseMap = function(map, lineNumber, columnNumber) {
    let sourceIndex = 0;
    let sourceLineNumber = 0;
    let sourceColumnNumber = 0;
    let nameIndex = 0;
    const sources = map[TextSourceMap._sourcesListSymbol];
    const names = map.names || [];
    const stringCharIterator = new TextSourceMap.StringCharIterator(map.mappings);
    let sourceURL = sources[sourceIndex];
    while (true) {
      if (stringCharIterator.peek() === ',') {
        stringCharIterator.next();
      } else {
        while (stringCharIterator.peek() === ';') {
          lineNumber += 1;
          columnNumber = 0;
          stringCharIterator.next();
        }
        if (!stringCharIterator.hasNext()) {
          break;
        }
      }
      columnNumber += this._decodeVLQ(stringCharIterator);
      if (!stringCharIterator.hasNext() || this._isSeparator(stringCharIterator.peek())) {
        this._mappings.push(new SourceMapEntry(lineNumber, columnNumber));
        continue;
      }
      const sourceIndexDelta = this._decodeVLQ(stringCharIterator);
      if (sourceIndexDelta) {
        sourceIndex += sourceIndexDelta;
        sourceURL = sources[sourceIndex];
      }
      sourceLineNumber += this._decodeVLQ(stringCharIterator);
      sourceColumnNumber += this._decodeVLQ(stringCharIterator);
      if (!stringCharIterator.hasNext() || this._isSeparator(stringCharIterator.peek())) {
        this._mappings.push(new SourceMapEntry(lineNumber, columnNumber, sourceURL, sourceLineNumber, sourceColumnNumber));
        continue;
      }
      nameIndex += this._decodeVLQ(stringCharIterator);
      this._mappings.push(new SourceMapEntry(lineNumber, columnNumber, sourceURL, sourceLineNumber, sourceColumnNumber, names[nameIndex]));
    }
    // As per spec, mappings are not necessarily sorted.
    this._mappings.sort(SourceMapEntry.compare);
  };
  /**
     * @param {string} char
     * @return {boolean}
     */
  TextSourceMap.prototype._isSeparator = function(char) {
    return char === ',' || char === ';';
  };
  /**
     * @param {!TextSourceMap.StringCharIterator} stringCharIterator
     * @return {number}
     */
  TextSourceMap.prototype._decodeVLQ = function(stringCharIterator) {
    // Read unsigned value.
    let result = 0;
    let shift = 0;
    let digit;
    do {
      digit = TextSourceMap._base64Map[stringCharIterator.next()];
      result += (digit & TextSourceMap._VLQ_BASE_MASK) << shift;
      shift += TextSourceMap._VLQ_BASE_SHIFT;
    } while (digit & TextSourceMap._VLQ_CONTINUATION_MASK);
    // Fix the sign.
    const negative = result & 1;
    result >>= 1;
    return negative ? -result : result;
  };
  /**
     * @param {string} url
     * @param {!TextUtils.TextRange} textRange
     * @return {!TextUtils.TextRange}
     */
  TextSourceMap.prototype.reverseMapTextRange = function(url, textRange) {
    /**
         * @param {!{lineNumber: number, columnNumber: number}} position
         * @param {!SourceMapEntry} mapping
         * @return {number}
         */
    function comparator(position, mapping) {
      if (position.lineNumber !== mapping.sourceLineNumber) {
        return position.lineNumber - mapping.sourceLineNumber;
      }
      return position.columnNumber - mapping.sourceColumnNumber;
    }
    const mappings = this._reversedMappings(url);
    const startIndex = mappings.lowerBound({lineNumber: textRange.startLine, columnNumber: textRange.startColumn}, comparator);
    const endIndex = mappings.upperBound({lineNumber: textRange.endLine, columnNumber: textRange.endColumn}, comparator);
    const startMapping = mappings[startIndex];
    const endMapping = mappings[endIndex];
    return new TextUtils.TextRange(startMapping.lineNumber, startMapping.columnNumber, endMapping.lineNumber, endMapping.columnNumber);
  };
  return TextSourceMap;
}());
exports.TextSourceMap = TextSourceMap;
TextSourceMap._VLQ_BASE_SHIFT = 5;
TextSourceMap._VLQ_BASE_MASK = (1 << 5) - 1;
TextSourceMap._VLQ_CONTINUATION_MASK = 1 << 5;
/**
 * @unrestricted
 */
TextSourceMap.StringCharIterator = /** @class */ (function() {
  /**
     * @param {string} string
     */
  function StringCharIterator(string) {
    this._string = string;
    this._position = 0;
  }
  /**
     * @return {string}
     */
  StringCharIterator.prototype.next = function() {
    return this._string.charAt(this._position++);
  };
  /**
     * @return {string}
     */
  StringCharIterator.prototype.peek = function() {
    return this._string.charAt(this._position);
  };
  /**
     * @return {boolean}
     */
  StringCharIterator.prototype.hasNext = function() {
    return this._position < this._string.length;
  };
  return StringCharIterator;
}());
/**
 * @unrestricted
 */
TextSourceMap.SourceInfo = /** @class */ (function() {
  /**
     * @param {?string} content
     * @param {?Array<!SourceMapEntry>} reverseMappings
     */
  function SourceInfo(content, reverseMappings) {
    this.content = content;
    this.reverseMappings = reverseMappings;
  }
  return SourceInfo;
}());
TextSourceMap._sourcesListSymbol = Symbol('sourcesList');
/* Legacy exported object */
globalThis.cdt.SDK = globalThis.cdt.SDK || {};
/* Legacy exported object */
globalThis.cdt.SDK = globalThis.cdt.SDK || {};
/** @interface */
globalThis.cdt.SDK.SourceMap = SourceMap;
/** @constructor */
globalThis.cdt.SDK.SourceMapV3 = SourceMapV3;
/** @constructor */
globalThis.cdt.SDK.SourceMapEntry = SourceMapEntry;
/** @constructor */
globalThis.cdt.SDK.TextSourceMap = TextSourceMap;
/** @constructor */
globalThis.cdt.SDK.SourceMap.EditResult = EditResult;