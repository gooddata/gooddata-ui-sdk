%global gdc_prefix /var/www/doc

Name: gooddata-react-components-web
Version: 3.%{gdcversion}
Release: 1%{dist}
Summary: GoodData React Components Web

Group: Applications/Productivity
License: Proprietary
URL: https://github.com/gooddata/gooddata-react-components
Source0: %{name}.tar.gz
BuildArch: noarch

BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

%description
%{summary}

%prep
%setup -q -n %{name} -c

%install
rm -rf $RPM_BUILD_ROOT

mkdir -p $RPM_BUILD_ROOT%{gdc_prefix}/react-components
cp -a dist-storybook/* $RPM_BUILD_ROOT%{gdc_prefix}/react-components/

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(0644,root,root,0755)
%dir %{gdc_prefix}/react-components
%{gdc_prefix}/react-components/*

%changelog
