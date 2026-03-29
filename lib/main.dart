import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(BanglaWeatherApp());
}

class BanglaWeatherApp extends StatelessWidget {
  BanglaWeatherApp({super.key, WeatherRepository? repository})
      : repository = repository ?? OpenMeteoWeatherRepository();

  final WeatherRepository repository;

  @override
  Widget build(BuildContext context) {
    final baseTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
    );
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF4AA8FF),
      brightness: Brightness.dark,
    ).copyWith(
      primary: const Color(0xFF62B7FF),
      secondary: const Color(0xFF82E4AF),
      surface: const Color(0xFF101C30),
      onSurface: Colors.white,
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Bangla Weather Brief',
      theme: baseTheme.copyWith(
        colorScheme: colorScheme,
        scaffoldBackgroundColor: const Color(0xFF08111F),
        textTheme: baseTheme.textTheme.apply(
          bodyColor: Colors.white,
          displayColor: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF101C31),
          hintStyle: TextStyle(color: Colors.white.withOpacity(0.54)),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 18,
            vertical: 16,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: BorderSide(
              color: colorScheme.primary.withOpacity(0.85),
            ),
          ),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: const Color(0xFF13213A),
          selectedColor: colorScheme.primary.withOpacity(0.16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(color: Colors.white.withOpacity(0.08)),
          ),
          labelStyle: const TextStyle(color: Colors.white),
          side: BorderSide(color: Colors.white.withOpacity(0.06)),
        ),
      ),
      home: WeatherDashboardPage(repository: repository),
    );
  }
}

abstract interface class WeatherRepository {
  Future<WeatherReport> fetchWeather({String query = 'Dhaka'});
}

class WeatherRepositoryException implements Exception {
  const WeatherRepositoryException(this.message);

  final String message;

  @override
  String toString() => message;
}

class OpenMeteoWeatherRepository implements WeatherRepository {
  OpenMeteoWeatherRepository({http.Client? client})
      : _client = client ?? http.Client();

  final http.Client _client;
  static const _requestTimeout = Duration(seconds: 15);

  @override
  Future<WeatherReport> fetchWeather({String query = 'Dhaka'}) async {
    final requestedCity = await _resolveCity(
      query.trim().isEmpty ? 'Dhaka' : query,
    );
    final uri = Uri.https('api.open-meteo.com', '/v1/forecast', {
      'latitude': requestedCity.latitude.toString(),
      'longitude': requestedCity.longitude.toString(),
      'current':
          'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,visibility,is_day',
      'hourly': 'temperature_2m,precipitation_probability,weather_code',
      'daily':
          'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
      'forecast_days': '5',
      'timezone': 'auto',
    });

    final response = await _client.get(uri).timeout(_requestTimeout);
    if (response.statusCode != 200) {
      throw const WeatherRepositoryException(
        'লাইভ আবহাওয়ার তথ্য আনা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
      );
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    return _parseReport(decoded, requestedCity);
  }

  Future<CityLocation> _resolveCity(String query) async {
    final preset = matchBangladeshCity(query);
    if (preset != null) {
      return preset;
    }

    final uri = Uri.https('geocoding-api.open-meteo.com', '/v1/search', {
      'name': query,
      'count': '10',
      'language': 'en',
      'format': 'json',
    });

    final response = await _client.get(uri).timeout(_requestTimeout);
    if (response.statusCode != 200) {
      throw const WeatherRepositoryException(
        'শহরের নাম যাচাই করা যায়নি। অনুগ্রহ করে আবার লিখুন।',
      );
    }

    final decoded = jsonDecode(response.body) as Map<String, dynamic>;
    final rawResults = decoded['results'];
    final results = rawResults is List
        ? rawResults.whereType<Map<String, dynamic>>().toList()
        : <Map<String, dynamic>>[];

    if (results.isEmpty) {
      throw const WeatherRepositoryException(
        'কোনো শহর পাওয়া যায়নি। বাংলাদেশি শহরের নাম বা পরিচিত English নাম ব্যবহার করুন।',
      );
    }

    final bangladeshMatch = results.firstWhere(
      (result) =>
          (result['country_code'] as String?) == 'BD' ||
          (result['country'] as String?) == 'Bangladesh',
      orElse: () => results.first,
    );

    final nameEn = (bangladeshMatch['name'] as String? ?? query).trim();
    final regionEn = (bangladeshMatch['admin1'] as String? ?? 'Bangladesh').trim();
    final countryEn =
        (bangladeshMatch['country'] as String? ?? 'Bangladesh').trim();

    return CityLocation(
      nameEn: nameEn,
      nameBn: banglaCityNameFor(nameEn),
      latitude: ((bangladeshMatch['latitude'] as num?) ?? 23.8103).toDouble(),
      longitude:
          ((bangladeshMatch['longitude'] as num?) ?? 90.4125).toDouble(),
      regionEn: regionEn,
      regionBn: banglaRegionNameFor(regionEn),
      countryEn: countryEn,
      countryBn: banglaCountryNameFor(countryEn),
    );
  }

  WeatherReport _parseReport(Map<String, dynamic> data, CityLocation city) {
    final current = data['current'];
    final hourly = data['hourly'];
    final daily = data['daily'];

    if (current is! Map<String, dynamic> ||
        hourly is! Map<String, dynamic> ||
        daily is! Map<String, dynamic>) {
      throw const WeatherRepositoryException(
        'আবহাওয়ার ডেটা অসম্পূর্ণ এসেছে। পরে আবার চেষ্টা করুন।',
      );
    }

    final currentWeather = CurrentWeather(
      observedAt: DateTime.parse(current['time'] as String),
      temperatureC: (current['temperature_2m'] as num).toDouble(),
      apparentTemperatureC: (current['apparent_temperature'] as num).toDouble(),
      humidityPercent: (current['relative_humidity_2m'] as num).round(),
      windSpeedKph: (current['wind_speed_10m'] as num).toDouble(),
      pressureHpa: (current['surface_pressure'] as num).toDouble(),
      visibilityKm:
          ((current['visibility'] as num?)?.toDouble() ?? 10000) / 1000,
      weatherCode: (current['weather_code'] as num).toInt(),
      isDay: ((current['is_day'] as num?)?.toInt() ?? 1) == 1,
    );

    final hourlyTimes = _stringList(hourly['time']);
    final hourlyTemperatures = _numList(hourly['temperature_2m']);
    final hourlyRain = _numList(hourly['precipitation_probability']);
    final hourlyCodes = _numList(hourly['weather_code']);

    final hourlyForecasts = <HourlyForecast>[];
    for (var index = 0; index < hourlyTimes.length; index++) {
      final time = DateTime.parse(hourlyTimes[index]);
      if (time.isBefore(currentWeather.observedAt)) {
        continue;
      }

      hourlyForecasts.add(
        HourlyForecast(
          time: time,
          temperatureC: hourlyTemperatures[index].toDouble(),
          rainChance: hourlyRain[index].round(),
          weatherCode: hourlyCodes[index].toInt(),
        ),
      );
      if (hourlyForecasts.length == 6) {
        break;
      }
    }

    final dailyDates = _stringList(daily['time']);
    final dailyMax = _numList(daily['temperature_2m_max']);
    final dailyMin = _numList(daily['temperature_2m_min']);
    final dailyRain = _numList(daily['precipitation_probability_max']);
    final dailyCodes = _numList(daily['weather_code']);
    final sunrises = _stringList(daily['sunrise']);
    final sunsets = _stringList(daily['sunset']);

    final dailyForecasts = List<DailyForecast>.generate(dailyDates.length, (
      index,
    ) {
      return DailyForecast(
        date: DateTime.parse(dailyDates[index]),
        maxTempC: dailyMax[index].toDouble(),
        minTempC: dailyMin[index].toDouble(),
        rainChance: dailyRain[index].round(),
        weatherCode: dailyCodes[index].toInt(),
        sunrise: DateTime.parse(sunrises[index]),
        sunset: DateTime.parse(sunsets[index]),
      );
    });

    return WeatherReport(
      city: city,
      current: currentWeather,
      hourly: hourlyForecasts,
      daily: dailyForecasts,
      generatedAt: DateTime.now(),
    );
  }

  List<String> _stringList(dynamic raw) =>
      raw is List ? raw.map((value) => value.toString()).toList() : <String>[];

  List<num> _numList(dynamic raw) => raw is List
      ? raw
            .map((value) => value is num ? value : num.tryParse('$value') ?? 0)
            .toList()
      : <num>[];
}

class WeatherDashboardPage extends StatefulWidget {
  const WeatherDashboardPage({super.key, required this.repository});

  final WeatherRepository repository;

  @override
  State<WeatherDashboardPage> createState() => _WeatherDashboardPageState();
}

class _WeatherDashboardPageState extends State<WeatherDashboardPage> {
  final TextEditingController _searchController = TextEditingController(
    text: 'Dhaka',
  );

  WeatherReport? _report;
  bool _isLoading = true;
  String? _errorMessage;
  String _activeQuery = 'Dhaka';

  @override
  void initState() {
    super.initState();
    _loadWeather();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadWeather({String? query}) async {
    final request = (query ?? _activeQuery).trim().isEmpty
        ? 'Dhaka'
        : (query ?? _activeQuery).trim();

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _activeQuery = request;
    });

    try {
      final report = await widget.repository.fetchWeather(query: request);
      if (!mounted) {
        return;
      }

      setState(() {
        _report = report;
        _isLoading = false;
        _activeQuery = report.city.nameEn;
        _searchController.value = TextEditingValue(
          text: report.city.nameEn,
          selection: TextSelection.collapsed(offset: report.city.nameEn.length),
        );
      });
    } on WeatherRepositoryException catch (error) {
      _handleError(error.message);
    } catch (_) {
      _handleError('ডেটা আনার সময় অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  }

  void _handleError(String message) {
    if (!mounted) {
      return;
    }

    if (_report != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      setState(() {
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = false;
      _errorMessage = message;
    });
  }

  void _submitSearch() {
    FocusScope.of(context).unfocus();
    _loadWeather(query: _searchController.text);
  }

  @override
  Widget build(BuildContext context) {
    final report = _report;

    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color(0xFF08111F),
              Color(0xFF0B1A30),
              Color(0xFF102543),
              Color(0xFF08111F),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: () => _loadWeather(query: _activeQuery),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _HeaderBar(
                    hasData: report != null,
                    lastUpdated: report?.generatedAt,
                    onRefresh: () => _loadWeather(query: _activeQuery),
                  ),
                  const SizedBox(height: 20),
                  _SearchPanel(
                    controller: _searchController,
                    selectedCityName: report?.city.nameEn ?? _activeQuery,
                    onSubmitted: (_) => _submitSearch(),
                    onSearchPressed: _submitSearch,
                    onPresetSelected: (city) => _loadWeather(query: city.nameEn),
                  ),
                  const SizedBox(height: 20),
                  if (_isLoading && report == null)
                    SizedBox(
                      height: MediaQuery.of(context).size.height * 0.6,
                      child: const Center(child: CircularProgressIndicator()),
                    )
                  else if (_errorMessage != null && report == null)
                    _ErrorState(
                      message: _errorMessage!,
                      onRetry: () => _loadWeather(query: _activeQuery),
                    )
                  else if (report != null) ...[
                    if (_isLoading) ...[
                      const LinearProgressIndicator(minHeight: 3),
                      const SizedBox(height: 16),
                    ],
                    _HeroCard(report: report),
                    const SizedBox(height: 20),
                    const _SectionHeader(
                      title: 'বর্তমান সূচক',
                      subtitle: 'আজকের সিদ্ধান্ত নেওয়ার জন্য মূল অপারেশনাল ডেটা',
                    ),
                    const SizedBox(height: 12),
                    _MetricsGrid(report: report),
                    const SizedBox(height: 20),
                    const _SectionHeader(
                      title: 'আগামী ৬ ঘণ্টা',
                      subtitle:
                          'স্বল্পমেয়াদি পরিকল্পনার জন্য তাপমাত্রা ও বৃষ্টির ঝুঁকি',
                    ),
                    const SizedBox(height: 12),
                    _HourlySection(hourly: report.hourly),
                    const SizedBox(height: 20),
                    const _SectionHeader(
                      title: '৫ দিনের পূর্বাভাস',
                      subtitle:
                          'প্রতিদিনের আবহাওয়া, তাপমাত্রা এবং বৃষ্টির সম্ভাবনা',
                    ),
                    const SizedBox(height: 12),
                    _DailyForecastSection(daily: report.daily),
                    const SizedBox(height: 20),
                    const _SectionHeader(
                      title: 'এক্সিকিউটিভ ব্রিফ',
                      subtitle: 'দ্রুত প্রস্তুতি, সূর্য সময়সূচি ও লোকেশন স্ন্যাপশট',
                    ),
                    const SizedBox(height: 12),
                    _ExecutiveBriefSection(report: report),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _HeaderBar extends StatelessWidget {
  const _HeaderBar({
    required this.hasData,
    required this.lastUpdated,
    required this.onRefresh,
  });

  final bool hasData;
  final DateTime? lastUpdated;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            gradient: const LinearGradient(
              colors: [Color(0xFF56B3FF), Color(0xFF2A6EDB)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: const [
              BoxShadow(
                color: Color(0x332A6EDB),
                blurRadius: 18,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: const Icon(Icons.cloud_rounded, color: Colors.white),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'বাংলা ওয়েদার ব্রিফ',
                style: Theme.of(
                  context,
                ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text(
                'কর্পোরেট আবহাওয়া ড্যাশবোর্ড',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white.withOpacity(0.74),
                ),
              ),
              if (hasData && lastUpdated != null) ...[
                const SizedBox(height: 6),
                Text(
                  'সর্বশেষ আপডেট: ${BanglaFormatters.longDate(lastUpdated!)} • ${BanglaFormatters.time(lastUpdated!)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ],
          ),
        ),
        IconButton.filledTonal(
          onPressed: onRefresh,
          icon: const Icon(Icons.refresh_rounded),
          tooltip: 'রিফ্রেশ',
        ),
      ],
    );
  }
}

class _SearchPanel extends StatelessWidget {
  const _SearchPanel({
    required this.controller,
    required this.selectedCityName,
    required this.onSubmitted,
    required this.onSearchPressed,
    required this.onPresetSelected,
  });

  final TextEditingController controller;
  final String selectedCityName;
  final ValueChanged<String> onSubmitted;
  final VoidCallback onSearchPressed;
  final ValueChanged<CityLocation> onPresetSelected;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: controller,
                  textInputAction: TextInputAction.search,
                  onSubmitted: onSubmitted,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search_rounded),
                    hintText: 'শহরের নাম লিখুন (যেমন Dhaka / Sylhet)',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              FilledButton.icon(
                onPressed: onSearchPressed,
                icon: const Icon(Icons.search_rounded),
                label: const Text('আপডেট'),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            'দ্রুত নির্বাচন',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: bangladeshCityPresets.map((city) {
              return ChoiceChip(
                label: Text(city.nameBn),
                selected: _normalize(selectedCityName) == _normalize(city.nameEn),
                onSelected: (_) => onPresetSelected(city),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          Text(
            'বাংলাদেশের প্রধান শহরগুলোর জন্য লাইভ ডেটা এবং সংক্ষিপ্ত নির্বাহী বিশ্লেষণ।',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white.withOpacity(0.68),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.report});

  final WeatherReport report;

  @override
  Widget build(BuildContext context) {
    final descriptor = describeWeather(
      report.current.weatherCode,
      isDay: report.current.isDay,
    );
    final riskColor = operationalRiskColor(report);

    return _Panel(
      padding: const EdgeInsets.all(24),
      gradient: LinearGradient(
        colors: [
          const Color(0xFF102342),
          descriptor.accent.withOpacity(0.22),
          const Color(0xFF0D1830),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderColor: descriptor.accent.withOpacity(0.35),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 780;
          final details = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.location_on_rounded, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      '${report.city.nameBn}, ${report.city.regionBn}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Text(
                descriptor.label,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: descriptor.accent,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                BanglaFormatters.temperature(report.current.temperatureC),
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  height: 0.95,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'অনুভূত তাপমাত্রা ${BanglaFormatters.temperature(report.current.apparentTemperatureC)} • আজকের বৃষ্টির ঝুঁকি ${BanglaFormatters.percentage(report.today.rainChance)}',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white.withOpacity(0.8),
                ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _MiniPill(
                    icon: Icons.warning_amber_rounded,
                    label: 'ঝুঁকি: ${operationalRiskLabel(report)}',
                    color: riskColor,
                  ),
                  _MiniPill(
                    icon: Icons.water_drop_rounded,
                    label:
                        'আর্দ্রতা ${BanglaFormatters.percentage(report.current.humidityPercent)}',
                    color: const Color(0xFF7DCBFF),
                  ),
                  _MiniPill(
                    icon: Icons.air_rounded,
                    label:
                        'বাতাস ${BanglaFormatters.wind(report.current.windSpeedKph)}',
                    color: const Color(0xFF82E4AF),
                  ),
                ],
              ),
            ],
          );

          final executiveCard = Container(
            width: wide ? 310 : double.infinity,
            margin: EdgeInsets.only(top: wide ? 0 : 22),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.07),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(descriptor.icon, size: 28, color: descriptor.accent),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'অপারেশনাল আউটলুক',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  executiveSummary(report),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withOpacity(0.82),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  planningNote(report),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withOpacity(0.64),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          );

          if (wide) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: details),
                const SizedBox(width: 22),
                executiveCard,
              ],
            );
          }

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [details, executiveCard],
          );
        },
      ),
    );
  }
}

class _MetricsGrid extends StatelessWidget {
  const _MetricsGrid({required this.report});

  final WeatherReport report;

  @override
  Widget build(BuildContext context) {
    final items = [
      _MetricItem(
        title: 'আর্দ্রতা',
        value: BanglaFormatters.percentage(report.current.humidityPercent),
        icon: Icons.water_drop_rounded,
        footnote: 'বর্তমান বাতাসে আর্দ্রতার মাত্রা',
      ),
      _MetricItem(
        title: 'বাতাস',
        value: BanglaFormatters.wind(report.current.windSpeedKph),
        icon: Icons.air_rounded,
        footnote: 'খোলা জায়গার কার্যক্রমে গুরুত্বপূর্ণ',
      ),
      _MetricItem(
        title: 'দৃশ্যমানতা',
        value: BanglaFormatters.visibility(report.current.visibilityKm),
        icon: Icons.visibility_rounded,
        footnote: 'সড়ক ও ভ্রমণ পরিকল্পনার জন্য সহায়ক',
      ),
      _MetricItem(
        title: 'বায়ুচাপ',
        value: BanglaFormatters.pressure(report.current.pressureHpa),
        icon: Icons.speed_rounded,
        footnote: 'চলমান আবহাওয়ার স্থিতিশীলতার সূচক',
      ),
      _MetricItem(
        title: 'বৃষ্টির ঝুঁকি',
        value: BanglaFormatters.percentage(report.today.rainChance),
        icon: Icons.umbrella_rounded,
        footnote: 'আজকের সর্বোচ্চ সম্ভাবনা',
      ),
      _MetricItem(
        title: 'কমফোর্ট স্কোর',
        value: BanglaFormatters.number(comfortScore(report)),
        icon: Icons.verified_user_rounded,
        footnote: 'সার্বিক অনুভূত আরাম ও স্থিতি',
      ),
    ];

    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width >= 720 ? 3 : 2;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: width >= 720 ? 1.55 : 1.08,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _Panel(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  item.icon,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const Spacer(),
              Text(
                item.title,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 6),
              Text(
                item.value,
                style: Theme.of(
                  context,
                ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                item.footnote,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withOpacity(0.62),
                  height: 1.35,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _HourlySection extends StatelessWidget {
  const _HourlySection({required this.hourly});

  final List<HourlyForecast> hourly;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: hourly.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final forecast = hourly[index];
          final descriptor = describeWeather(
            forecast.weatherCode,
            isDay: forecast.time.hour >= 6 && forecast.time.hour < 18,
          );
          return _Panel(
            width: 132,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  BanglaFormatters.time(forecast.time),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withOpacity(0.64),
                  ),
                ),
                const Spacer(),
                Icon(descriptor.icon, color: descriptor.accent, size: 30),
                const SizedBox(height: 10),
                Text(
                  BanglaFormatters.temperature(forecast.temperatureC),
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  'বৃষ্টি ${BanglaFormatters.percentage(forecast.rainChance)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withOpacity(0.72),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DailyForecastSection extends StatelessWidget {
  const _DailyForecastSection({required this.daily});

  final List<DailyForecast> daily;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: daily.map((forecast) {
        final descriptor = describeWeather(forecast.weatherCode, isDay: true);
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _Panel(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        BanglaFormatters.weekdayShort(forecast.date),
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        BanglaFormatters.monthDay(forecast.date),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(descriptor.icon, color: descriptor.accent),
                const SizedBox(width: 14),
                Expanded(
                  flex: 3,
                  child: Text(
                    descriptor.shortLabel,
                    style: Theme.of(
                      context,
                    ).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${BanglaFormatters.temperature(forecast.maxTempC)} / ${BanglaFormatters.temperature(forecast.minTempC)}',
                        textAlign: TextAlign.end,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'বৃষ্টি ${BanglaFormatters.percentage(forecast.rainChance)}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _ExecutiveBriefSection extends StatelessWidget {
  const _ExecutiveBriefSection({required this.report});

  final WeatherReport report;

  @override
  Widget build(BuildContext context) {
    final cards = [
      _BriefCardData(
        title: 'প্রস্তুতি নোট',
        icon: Icons.assignment_rounded,
        body: planningNote(report),
      ),
      _BriefCardData(
        title: 'সূর্য সময়সূচি',
        icon: Icons.wb_sunny_rounded,
        body:
            'সূর্যোদয় ${BanglaFormatters.time(report.today.sunrise)}\nসূর্যাস্ত ${BanglaFormatters.time(report.today.sunset)}',
      ),
      _BriefCardData(
        title: 'লোকেশন প্রোফাইল',
        icon: Icons.public_rounded,
        body:
            '${report.city.nameBn}, ${report.city.countryBn}\nকোঅর্ডিনেট: ${BanglaFormatters.coordinates(report.city.latitude, report.city.longitude)}',
      ),
    ];

    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width >= 720 ? 3 : 1;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: cards.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: width >= 720 ? 1.5 : 2.4,
      ),
      itemBuilder: (context, index) {
        final card = cards[index];
        return _Panel(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  card.icon,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                card.title,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 10),
              Text(
                card.body,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withOpacity(0.78),
                  height: 1.45,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Colors.white.withOpacity(0.64),
          ),
        ),
      ],
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Icon(Icons.error_outline_rounded, size: 52),
          const SizedBox(height: 14),
          Text(
            message,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('আবার চেষ্টা করুন'),
          ),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.width,
    this.gradient,
    this.borderColor,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double? width;
  final Gradient? gradient;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: padding,
      decoration: BoxDecoration(
        gradient:
            gradient ??
            LinearGradient(
              colors: [
                const Color(0xFF12203A).withOpacity(0.95),
                const Color(0xFF0C172B).withOpacity(0.94),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: borderColor ?? Colors.white.withOpacity(0.08),
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x22000000),
            blurRadius: 24,
            offset: Offset(0, 16),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _MiniPill extends StatelessWidget {
  const _MiniPill({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 8),
          Text(label),
        ],
      ),
    );
  }
}

class _MetricItem {
  const _MetricItem({
    required this.title,
    required this.value,
    required this.icon,
    required this.footnote,
  });

  final String title;
  final String value;
  final IconData icon;
  final String footnote;
}

class _BriefCardData {
  const _BriefCardData({
    required this.title,
    required this.icon,
    required this.body,
  });

  final String title;
  final IconData icon;
  final String body;
}

class BanglaFormatters {
  BanglaFormatters._();

  static const List<String> _months = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];

  static const List<String> _weekdaysLong = [
    'সোমবার',
    'মঙ্গলবার',
    'বুধবার',
    'বৃহস্পতিবার',
    'শুক্রবার',
    'শনিবার',
    'রবিবার',
  ];

  static const List<String> _weekdaysShort = [
    'সোম',
    'মঙ্গল',
    'বুধ',
    'বৃহ',
    'শুক্র',
    'শনি',
    'রবি',
  ];

  static const Map<String, String> _digits = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };

  static String digits(Object value) {
    final raw = value.toString();
    final buffer = StringBuffer();

    for (final codePoint in raw.runes) {
      final char = String.fromCharCode(codePoint);
      buffer.write(_digits[char] ?? char);
    }
    return buffer.toString();
  }

  static String number(num value, {int fractionDigits = 0}) =>
      digits(value.toStringAsFixed(fractionDigits));

  static String temperature(num value) => '${number(value.round())}°';

  static String percentage(num value) => '${number(value.round())}%';

  static String wind(num value) => '${number(value.round())} কিমি/ঘ';

  static String visibility(num value) => '${number(value, fractionDigits: 1)} কিমি';

  static String pressure(num value) => '${number(value.round())} hPa';

  static String weekdayShort(DateTime date) => _weekdaysShort[date.weekday - 1];

  static String weekdayLong(DateTime date) => _weekdaysLong[date.weekday - 1];

  static String monthDay(DateTime date) => '${digits(date.day)} ${_months[date.month - 1]}';

  static String longDate(DateTime date) => '${weekdayLong(date)}, ${monthDay(date)}';

  static String time(DateTime date) {
    final hour = date.hour;
    final displayHour = hour % 12 == 0 ? 12 : hour % 12;
    final minute = date.minute.toString().padLeft(2, '0');

    String period;
    if (hour < 6) {
      period = 'রাত';
    } else if (hour < 12) {
      period = 'সকাল';
    } else if (hour < 16) {
      period = 'দুপুর';
    } else if (hour < 19) {
      period = 'বিকেল';
    } else {
      period = 'রাত';
    }

    return '${digits(displayHour)}:${digits(minute)} $period';
  }

  static String coordinates(double latitude, double longitude) =>
      '${number(latitude, fractionDigits: 2)} / ${number(longitude, fractionDigits: 2)}';
}

class WeatherDescriptor {
  const WeatherDescriptor({
    required this.label,
    required this.shortLabel,
    required this.icon,
    required this.accent,
  });

  final String label;
  final String shortLabel;
  final IconData icon;
  final Color accent;
}

WeatherDescriptor describeWeather(int code, {required bool isDay}) {
  if (code == 0) {
    return WeatherDescriptor(
      label: 'পরিষ্কার আকাশ',
      shortLabel: 'রৌদ্রোজ্জ্বল',
      icon: isDay ? Icons.wb_sunny_rounded : Icons.nightlight_round,
      accent: const Color(0xFFFFD166),
    );
  }

  if (code == 1 || code == 2) {
    return const WeatherDescriptor(
      label: 'আংশিক মেঘলা',
      shortLabel: 'মেঘের উপস্থিতি',
      icon: Icons.cloud_queue_rounded,
      accent: Color(0xFF8AD0FF),
    );
  }

  if (code == 3) {
    return const WeatherDescriptor(
      label: 'ঘন মেঘলা',
      shortLabel: 'মেঘাচ্ছন্ন',
      icon: Icons.cloud_rounded,
      accent: Color(0xFF9AA7BD),
    );
  }

  if (code == 45 || code == 48) {
    return const WeatherDescriptor(
      label: 'কুয়াশাচ্ছন্ন',
      shortLabel: 'কুয়াশা',
      icon: Icons.blur_on_rounded,
      accent: Color(0xFFB8C5D9),
    );
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return const WeatherDescriptor(
      label: 'বৃষ্টির সম্ভাবনা',
      shortLabel: 'বৃষ্টি',
      icon: Icons.grain_rounded,
      accent: Color(0xFF67A6FF),
    );
  }

  if (code >= 71 && code <= 77) {
    return const WeatherDescriptor(
      label: 'হালকা তুষার',
      shortLabel: 'তুষার',
      icon: Icons.ac_unit_rounded,
      accent: Color(0xFFD9E9FF),
    );
  }

  if (code >= 95) {
    return const WeatherDescriptor(
      label: 'বজ্রসহ বৃষ্টি',
      shortLabel: 'বজ্রঝড়',
      icon: Icons.thunderstorm_rounded,
      accent: Color(0xFFFFA26B),
    );
  }

  return const WeatherDescriptor(
    label: 'পরিবর্তনশীল আবহাওয়া',
    shortLabel: 'পরিবর্তনশীল',
    icon: Icons.cloud_queue_rounded,
    accent: Color(0xFF9DD3FF),
  );
}

int operationalRiskScore(WeatherReport report) {
  var score = 0;
  final rainChance = report.today.rainChance;
  final temperature = report.current.temperatureC;
  final windSpeed = report.current.windSpeedKph;
  final visibility = report.current.visibilityKm;

  if (rainChance >= 70) {
    score += 3;
  } else if (rainChance >= 40) {
    score += 2;
  } else if (rainChance >= 20) {
    score += 1;
  }

  if (temperature >= 35) {
    score += 2;
  } else if (temperature >= 32) {
    score += 1;
  }

  if (windSpeed >= 30) {
    score += 2;
  } else if (windSpeed >= 20) {
    score += 1;
  }

  if (visibility < 2) {
    score += 2;
  } else if (visibility < 5) {
    score += 1;
  }

  return score;
}

String operationalRiskLabel(WeatherReport report) {
  final score = operationalRiskScore(report);
  if (score >= 6) {
    return 'উচ্চ';
  }
  if (score >= 3) {
    return 'মাঝারি';
  }
  return 'নিম্ন';
}

Color operationalRiskColor(WeatherReport report) {
  final score = operationalRiskScore(report);
  if (score >= 6) {
    return const Color(0xFFFF936B);
  }
  if (score >= 3) {
    return const Color(0xFFFFC857);
  }
  return const Color(0xFF82E4AF);
}

String executiveSummary(WeatherReport report) {
  final rainChance = report.today.rainChance;
  final temperature = report.current.temperatureC;
  final windSpeed = report.current.windSpeedKph;

  if (rainChance >= 70) {
    return 'আজ বৃষ্টির সম্ভাবনা বেশি, তাই বাইরের সভা, মাঠপর্যায়ের ভিজিট ও লজিস্টিক কার্যক্রমে বিকল্প পরিকল্পনা রাখা উচিত।';
  }
  if (windSpeed >= 28) {
    return 'বাতাসের গতি তুলনামূলক বেশি, তাই হালকা কাঠামো, সাইট ব্যানার ও খোলা জায়গার কার্যক্রম সতর্কতার সাথে পরিচালনা করুন।';
  }
  if (temperature >= 35) {
    return 'তাপমাত্রা উচ্চ, তাই কর্মীদের জন্য হাইড্রেশন, বিশ্রাম বিরতি এবং ইনডোর সহায়তা প্রস্তুত রাখা ভালো।';
  }
  return 'আবহাওয়া তুলনামূলক স্থিতিশীল রয়েছে; নিয়মিত কার্যক্রম, মিটিং এবং ফিল্ড অপারেশন চালানোর জন্য পরিস্থিতি উপযোগী।';
}

String planningNote(WeatherReport report) {
  if (report.today.rainChance >= 50) {
    return 'ছাতা, রেইন-কভার এবং যাতায়াতের অতিরিক্ত সময় পরিকল্পনায় রাখুন।';
  }
  if (report.current.visibilityKm < 5) {
    return 'লো-ভিজিবিলিটি পরিস্থিতিতে সড়ক চলাচল ও ডেলিভারি সূচিতে বাফার রাখুন।';
  }
  if (report.current.temperatureC >= 34) {
    return 'উচ্চ তাপমাত্রার সময়ে বহিরাঙ্গন শিফট ছোট ভাগে ভাগ করা শ্রেয়।';
  }
  return 'বিশেষ ব্যাকআপ ছাড়াই সাধারণ অপারেশনাল পরিকল্পনা কার্যকর থাকবে।';
}

int comfortScore(WeatherReport report) {
  final score =
      100 -
      (report.today.rainChance * 0.35).round() -
      (report.current.windSpeedKph > 24 ? 10 : 0) -
      (report.current.temperatureC > 34 ? 12 : 0) -
      (report.current.visibilityKm < 5 ? 8 : 0);
  return score.clamp(35, 98).toInt();
}

class CityLocation {
  const CityLocation({
    required this.nameEn,
    required this.nameBn,
    required this.latitude,
    required this.longitude,
    required this.regionEn,
    required this.regionBn,
    required this.countryEn,
    required this.countryBn,
  });

  final String nameEn;
  final String nameBn;
  final double latitude;
  final double longitude;
  final String regionEn;
  final String regionBn;
  final String countryEn;
  final String countryBn;
}

class CurrentWeather {
  const CurrentWeather({
    required this.observedAt,
    required this.temperatureC,
    required this.apparentTemperatureC,
    required this.humidityPercent,
    required this.windSpeedKph,
    required this.pressureHpa,
    required this.visibilityKm,
    required this.weatherCode,
    required this.isDay,
  });

  final DateTime observedAt;
  final double temperatureC;
  final double apparentTemperatureC;
  final int humidityPercent;
  final double windSpeedKph;
  final double pressureHpa;
  final double visibilityKm;
  final int weatherCode;
  final bool isDay;
}

class HourlyForecast {
  const HourlyForecast({
    required this.time,
    required this.temperatureC,
    required this.rainChance,
    required this.weatherCode,
  });

  final DateTime time;
  final double temperatureC;
  final int rainChance;
  final int weatherCode;
}

class DailyForecast {
  const DailyForecast({
    required this.date,
    required this.maxTempC,
    required this.minTempC,
    required this.rainChance,
    required this.weatherCode,
    required this.sunrise,
    required this.sunset,
  });

  final DateTime date;
  final double maxTempC;
  final double minTempC;
  final int rainChance;
  final int weatherCode;
  final DateTime sunrise;
  final DateTime sunset;
}

class WeatherReport {
  const WeatherReport({
    required this.city,
    required this.current,
    required this.hourly,
    required this.daily,
    required this.generatedAt,
  });

  final CityLocation city;
  final CurrentWeather current;
  final List<HourlyForecast> hourly;
  final List<DailyForecast> daily;
  final DateTime generatedAt;

  DailyForecast get today => daily.first;
}

const List<CityLocation> bangladeshCityPresets = [
  CityLocation(
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    latitude: 23.8103,
    longitude: 90.4125,
    regionEn: 'Dhaka Division',
    regionBn: 'ঢাকা বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    latitude: 22.3569,
    longitude: 91.7832,
    regionEn: 'Chattogram Division',
    regionBn: 'চট্টগ্রাম বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: 'Sylhet',
    nameBn: 'সিলেট',
    latitude: 24.8949,
    longitude: 91.8687,
    regionEn: 'Sylhet Division',
    regionBn: 'সিলেট বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    latitude: 22.8456,
    longitude: 89.5403,
    regionEn: 'Khulna Division',
    regionBn: 'খুলনা বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    latitude: 24.3745,
    longitude: 88.6042,
    regionEn: 'Rajshahi Division',
    regionBn: 'রাজশাহী বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: 'Barishal',
    nameBn: 'বরিশাল',
    latitude: 22.701,
    longitude: 90.3535,
    regionEn: 'Barishal Division',
    regionBn: 'বরিশাল বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: 'Rangpur',
    nameBn: 'রংপুর',
    latitude: 25.7439,
    longitude: 89.2752,
    regionEn: 'Rangpur Division',
    regionBn: 'রংপুর বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    latitude: 24.7471,
    longitude: 90.4203,
    regionEn: 'Mymensingh Division',
    regionBn: 'ময়মনসিংহ বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
  CityLocation(
    nameEn: "Cox's Bazar",
    nameBn: 'কক্সবাজার',
    latitude: 21.4272,
    longitude: 92.0058,
    regionEn: 'Chattogram Division',
    regionBn: 'চট্টগ্রাম বিভাগ',
    countryEn: 'Bangladesh',
    countryBn: 'বাংলাদেশ',
  ),
];

const Map<String, String> _cityTranslations = {
  'Dhaka': 'ঢাকা',
  'Chattogram': 'চট্টগ্রাম',
  'Chittagong': 'চট্টগ্রাম',
  'Sylhet': 'সিলেট',
  'Khulna': 'খুলনা',
  'Rajshahi': 'রাজশাহী',
  'Barishal': 'বরিশাল',
  'Barisal': 'বরিশাল',
  'Rangpur': 'রংপুর',
  'Mymensingh': 'ময়মনসিংহ',
  "Cox's Bazar": 'কক্সবাজার',
  'Cumilla': 'কুমিল্লা',
  'Comilla': 'কুমিল্লা',
  'Gazipur': 'গাজীপুর',
  'Narayanganj': 'নারায়ণগঞ্জ',
  'Jashore': 'যশোর',
  'Jessore': 'যশোর',
  'Bogura': 'বগুড়া',
  'Bogra': 'বগুড়া',
  'Noakhali': 'নোয়াখালী',
  'Pabna': 'পাবনা',
  'Dinajpur': 'দিনাজপুর',
  'Feni': 'ফেনী',
};

const Map<String, String> _regionTranslations = {
  'Dhaka Division': 'ঢাকা বিভাগ',
  'Chattogram Division': 'চট্টগ্রাম বিভাগ',
  'Chittagong Division': 'চট্টগ্রাম বিভাগ',
  'Sylhet Division': 'সিলেট বিভাগ',
  'Khulna Division': 'খুলনা বিভাগ',
  'Rajshahi Division': 'রাজশাহী বিভাগ',
  'Barishal Division': 'বরিশাল বিভাগ',
  'Barisal Division': 'বরিশাল বিভাগ',
  'Rangpur Division': 'রংপুর বিভাগ',
  'Mymensingh Division': 'ময়মনসিংহ বিভাগ',
};

String banglaCityNameFor(String nameEn) => _cityTranslations[nameEn] ?? nameEn;

String banglaRegionNameFor(String regionEn) =>
    _regionTranslations[regionEn] ?? regionEn;

String banglaCountryNameFor(String countryEn) =>
    countryEn == 'Bangladesh' ? 'বাংলাদেশ' : countryEn;

CityLocation? matchBangladeshCity(String query) {
  final trimmed = query.trim();
  if (trimmed.isEmpty) {
    return bangladeshCityPresets.first;
  }

  final normalized = _normalize(trimmed);
  for (final city in bangladeshCityPresets) {
    if (_normalize(city.nameEn) == normalized || city.nameBn.contains(trimmed)) {
      return city;
    }
  }
  return null;
}

String _normalize(String value) =>
    value.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
