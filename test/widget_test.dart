import 'package:flutter_test/flutter_test.dart';

import 'package:bangla_weather_corp/main.dart';

class FakeWeatherRepository implements WeatherRepository {
  @override
  Future<WeatherReport> fetchWeather({String query = 'Dhaka'}) async {
    return WeatherReport(
      city: const CityLocation(
        nameEn: 'Dhaka',
        nameBn: 'ঢাকা',
        latitude: 23.8103,
        longitude: 90.4125,
        regionEn: 'Dhaka Division',
        regionBn: 'ঢাকা বিভাগ',
        countryEn: 'Bangladesh',
        countryBn: 'বাংলাদেশ',
      ),
      current: CurrentWeather(
        observedAt: DateTime(2026, 3, 29, 9),
        temperatureC: 31,
        apparentTemperatureC: 34,
        humidityPercent: 68,
        windSpeedKph: 14,
        pressureHpa: 1007,
        visibilityKm: 8.2,
        weatherCode: 1,
        isDay: true,
      ),
      hourly: List<HourlyForecast>.generate(6, (index) {
        return HourlyForecast(
          time: DateTime(2026, 3, 29, 10 + index),
          temperatureC: 30 - index * 0.4,
          rainChance: 20 + index * 5,
          weatherCode: index.isEven ? 1 : 61,
        );
      }),
      daily: List<DailyForecast>.generate(5, (index) {
        final date = DateTime(2026, 3, 29 + index);
        return DailyForecast(
          date: date,
          maxTempC: 32 - index * 0.3,
          minTempC: 24 - index * 0.2,
          rainChance: 35 + index * 4,
          weatherCode: index.isEven ? 1 : 61,
          sunrise: DateTime(date.year, date.month, date.day, 5, 48),
          sunset: DateTime(date.year, date.month, date.day, 18, 11),
        );
      }),
      generatedAt: DateTime(2026, 3, 29, 9),
    );
  }
}

void main() {
  testWidgets('renders Bangla corporate weather dashboard', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      BanglaWeatherApp(repository: FakeWeatherRepository()),
    );
    await tester.pumpAndSettle();

    expect(find.text('বাংলা ওয়েদার ব্রিফ'), findsOneWidget);
    expect(find.text('কর্পোরেট আবহাওয়া ড্যাশবোর্ড'), findsOneWidget);
    expect(find.text('বর্তমান সূচক'), findsOneWidget);
    expect(find.text('৫ দিনের পূর্বাভাস'), findsOneWidget);
    expect(find.text('এক্সিকিউটিভ ব্রিফ'), findsOneWidget);
    expect(find.text('ঢাকা'), findsWidgets);
  });
}
